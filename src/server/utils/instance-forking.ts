import { InstanceParams } from "@/lib/validations/params";
import { Flag, PrismaClient, Role, Tag, UserInInstance } from "@prisma/client";

export async function getAvailableStudents(
  db: PrismaClient,
  params: InstanceParams,
) {
  return await db.userInInstance.findMany({
    where: {
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: params.instance,
      role: Role.STUDENT,
      studentAllocation: { is: null },
    },
  });
}

export async function getAvailableSupervisors(
  db: PrismaClient,
  params: InstanceParams,
): Promise<AvailableSupervisor[]> {
  const allSupervisors = await db.userInInstance.findMany({
    where: {
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: params.instance,
      role: Role.SUPERVISOR,
    },
    select: {
      userId: true,
      role: true,
      // get the supervisors projects, and for each project get their allocations
      supervisorProjects: {
        select: {
          id: true,
          title: true,
          description: true,
          capacityUpperBound: true,
          allocations: true,
          flagOnProjects: { select: { flag: { select: { title: true } } } },
          tagOnProject: { select: { tag: { select: { title: true } } } },
        },
      },
      // for each supervisor also, get their instance details
      supervisorInstanceDetails: {
        where: {
          allocationGroupId: params.group,
          allocationSubGroupId: params.subGroup,
          allocationInstanceId: params.instance,
        },
        select: {
          projectAllocationLowerBound: true,
          projectAllocationTarget: true,
          projectAllocationUpperBound: true,
        },
      },
    },
  });

  // this is the list of supervisors that are not at capacity
  return allSupervisors
    .map(({ supervisorInstanceDetails, ...s }) => {
      const capacities = supervisorInstanceDetails[0];

      const allocationCount = s.supervisorProjects
        .map((p) => p.allocations.length)
        .reduce((a, b) => a + b, 0);

      const remainingCapacity =
        capacities.projectAllocationUpperBound - allocationCount;

      return {
        userId: s.userId,
        role: s.role,

        capacities: { ...capacities, remainingCapacity },

        projects: s.supervisorProjects.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          capacityUpperBound: p.capacityUpperBound,
          allocationCount: p.allocations.length,
          flags: p.flagOnProjects.map((f) => f.flag),
          tags: p.tagOnProject.map((t) => t.tag),
        })),
      };
    })
    .filter((s) => s.capacities.remainingCapacity > 0);
}

export async function getAvailableProjects(
  availableSupervisors: AvailableSupervisor[],
) {
  return availableSupervisors
    .flatMap((s) =>
      s.projects.map((p) => ({
        ...p,
        supervisorId: s.userId,
        actualCapacity: p.allocationCount,
        remainingCapacity: p.capacityUpperBound - p.allocationCount,
      })),
    )
    .filter((p) => p.remainingCapacity > 0);
}

export async function copyInstanceFlags(
  db: PrismaClient,
  params: InstanceParams,
  forkedInstanceId: string,
) {
  const flags = await db.flag.findMany({
    where: {
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: params.instance,
    },
  });

  await db.flag.createMany({
    data: flags.map(({ title }) => ({
      title,
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: forkedInstanceId,
    })),
  });

  return await db.flag.findMany({
    where: {
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: forkedInstanceId,
    },
  });
}

export async function copyInstanceTags(
  db: PrismaClient,
  params: InstanceParams,
  forkedInstanceId: string,
) {
  const tags = await db.tag.findMany({
    where: {
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: params.instance,
    },
  });

  await db.tag.createMany({
    data: tags.map(({ title }) => ({
      title,
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: forkedInstanceId,
    })),
  });

  return await db.tag.findMany({
    where: {
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: forkedInstanceId,
    },
  });
}

export function findItemFromTitle<T extends { id: string; title: string }>(
  items: T[],
  title: string,
) {
  const itemIdx = items.findIndex((item) => item.title === title);
  if (itemIdx === -1) throw new Error(`Title ${title} not found in items`);
  return items[itemIdx];
}

export async function createStudents(
  db: PrismaClient,
  availableStudents: UserInInstance[],
  forkedInstanceId: string,
) {
  await db.userInInstance.createMany({
    data: availableStudents.map((student) => ({
      ...student,
      allocationInstanceId: forkedInstanceId,
    })),
  });
}

export async function createSupervisors(
  db: PrismaClient,
  availableSupervisors: AvailableSupervisor[],
  params: InstanceParams,
  forkedInstanceId: string,
) {
  await db.userInInstance.createMany({
    data: availableSupervisors.map((supervisor) => ({
      ...supervisor,
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: forkedInstanceId,
    })),
  });

  await db.supervisorInstanceDetails.createMany({
    data: availableSupervisors.map((s) => {
      return {
        ...s,
        allocationGroupId: params.group,
        allocationSubGroupId: params.subGroup,
        allocationInstanceId: forkedInstanceId,
        projectAllocationLowerBound: s.capacities.projectAllocationLowerBound,
        projectAllocationTarget: s.capacities.projectAllocationTarget,
        projectAllocationUpperBound: s.capacities.remainingCapacity,
      };
    }),
  });
}

export async function createProjects(
  db: PrismaClient,
  availableProjects: AvailableProjects[],
  params: InstanceParams,
  forkedInstanceId: string,
): Promise<ModifiedProject[]> {
  await db.project.createMany({
    data: availableProjects.map((p) => ({
      title: p.title,
      description: p.description,
      supervisorId: p.supervisorId,
      capacityLowerBound: 0,
      capacityUpperBound: p.remainingCapacity,
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: forkedInstanceId,
    })),
  });

  const newProjects = await db.project.findMany({
    where: {
      allocationGroupId: params.group,
      allocationSubGroupId: params.subGroup,
      allocationInstanceId: forkedInstanceId,
    },
    include: {
      flagOnProjects: { select: { flag: true } },
      tagOnProject: { select: { tag: true } },
    },
  });

  return newProjects.map((p) => ({
    ...p,
    flags: p.flagOnProjects.map((f) => f.flag),
    tags: p.tagOnProject.map((t) => t.tag),
  }));
}

export async function createFlagOnProjects(
  db: PrismaClient,
  newProjects: ModifiedProject[],
  newFlags: Flag[],
) {
  await db.flagOnProject.createMany({
    data: newProjects.flatMap((p) =>
      p.flags.map((f) => ({
        projectId: p.id,
        flagId: findItemFromTitle(newFlags, f.title).id,
      })),
    ),
  });
}

export async function createTagOnProjects(
  db: PrismaClient,
  newProjects: ModifiedProject[],
  newTags: Tag[],
) {
  await db.tagOnProject.createMany({
    data: newProjects.flatMap((p) =>
      p.tags.map((t) => ({
        projectId: p.id,
        tagId: findItemFromTitle(newTags, t.title).id,
      })),
    ),
  });
}

type AvailableSupervisor = {
  userId: string;
  role: Role;
  capacities: {
    remainingCapacity: number;
    projectAllocationLowerBound: number;
    projectAllocationTarget: number;
    projectAllocationUpperBound: number;
  };
  projects: {
    id: string;
    title: string;
    description: string;
    capacityUpperBound: number;
    flags: { title: string }[];
    tags: { title: string }[];
    allocationCount: number;
  }[];
};

type AvailableProjects = {
  id: string;
  title: string;
  description: string;
  supervisorId: string;
  capacityUpperBound: number;
  actualCapacity: number;
  remainingCapacity: number;
  flags: {
    title: string;
  }[];
  tags: {
    title: string;
  }[];
};

type ModifiedProject = Omit<
  AvailableProjects,
  "remainingCapacity" | "actualCapacity"
>;