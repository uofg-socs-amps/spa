import {
  AdminInSpace,
  AdminLevel,
  AllocationGroup,
  AllocationInstance,
  AllocationSubGroup,
  Flag,
  FlagOnProject,
  Invitation,
  Preference,
  PreferenceType,
  Project,
  Role,
  SavedPreference,
  Stage,
  StudentDetails,
  SupervisorInstanceDetails,
  Tag,
  TagOnProject,
  User,
  UserInInstance,
} from "@prisma/client";
import { addDays, subDays } from "date-fns";

import {
  GenerousAlgorithm,
  GreedyAlgorithm,
  GreedyGenAlgorithm,
  MinCostAlgorithm,
} from "@/lib/algorithms";
import { slugify } from "@/lib/utils/general/slugify";

import { preferenceData } from "./preferences";
import { projectData } from "./projects";

import { env } from "@/env";

export const EVALUATORS = 30;

type StableUser = Omit<User, "id"> & { id: string };
type New<T> = Omit<T, "id" | "systemId">;

const superAdmin: StableUser = {
  id: env.DEV_ID,
  name: env.DEV_NAME,
  email: env.DEV_EMAIL,
};

const superAdminInSpace: New<AdminInSpace> = {
  userId: superAdmin.id,
  allocationGroupId: null,
  allocationSubGroupId: null,
  adminLevel: AdminLevel.SUPER,
};

export const superAdmin_users = [superAdmin];
export const superAdmin_levels = [superAdminInSpace];

export const to_ID = (ID: number) => ID.toString().padStart(3, "0");

export const evaluator__groupAdmin = (ID: string): StableUser => ({
  id: `${ID}-0000001a`,
  name: "Group Admin Evaluator",
  email: `${ID}-0000group@email.com`,
});

export const evaluator__subGroupAdmin = (ID: string): StableUser => ({
  id: `${ID}-012345w`,
  name: "Admin Evaluator",
  email: `${ID}-012345w@email.com`,
});

const dummy__supervisors = (ID: string): StableUser[] => [
  {
    id: `${ID}-123456s`,
    name: "Daniel Schmidt",
    email: `${ID}-123456s@email.com`,
  },
  {
    id: `${ID}-123457j`,
    name: "Sarah Jones",
    email: `${ID}-123457j@email.com`,
  },
  {
    id: `${ID}-123458t`,
    name: "Kai Tanaka",
    email: `${ID}-123458t@email.com`,
  },
  {
    id: `${ID}-123459l`,
    name: "Maria Lopez",
    email: `${ID}-123459l@email.com`,
  },
];

export const evaluator__supervisor = (ID: string): StableUser => ({
  id: `${ID}-123460d`,
  name: "Supervisor Evaluator",
  email: `${ID}-123460d@email.com`,
});

const allSupervisors = (ID: string): StableUser[] => [
  ...dummy__supervisors(ID),
  evaluator__supervisor(ID),
];

const dummy__students = (ID: string): StableUser[] => [
  {
    id: `${ID}-234567k`,
    name: "Aaliyah Khan",
    email: `${ID}-234567k@email.com`,
  },
  {
    id: `${ID}-234568g`,
    name: "Diego Garcia",
    email: `${ID}-234568g@email.com`,
  },
  { id: `${ID}-234569c`, name: "Mei Chen", email: `${ID}-234569c@email.com` },
  {
    id: `${ID}-234570p`,
    name: "Anya Petrova",
    email: `${ID}-234570p@email.com`,
  },
  {
    id: `${ID}-234571d`,
    name: "Aisha Diallo",
    email: `${ID}-234571d@email.com`,
  },
  {
    id: `${ID}-234572c`,
    name: "Ethan Cohen",
    email: `${ID}-234572c@email.com`,
  },
  {
    id: `${ID}-234573b`,
    name: "Nadira Benali",
    email: `${ID}-234573b@email.com`,
  },
  {
    id: `${ID}-234574o`,
    name: "Liam O'Sullivan",
    email: `${ID}-234574o@email.com`,
  },
  {
    id: `${ID}-234575y`,
    name: "Hana Yoshida",
    email: `${ID}-234575y@email.com`,
  },
  {
    id: `${ID}-234576n`,
    name: "David Nguyen",
    email: `${ID}-234576n@email.com`,
  },
  {
    id: `${ID}-234577r`,
    name: "Elena Rodriguez",
    email: `${ID}-234577r@email.com`,
  },
  {
    id: `${ID}-234578a`,
    name: "Kofi Asante",
    email: `${ID}-234578a@email.com`,
  },
  {
    id: `${ID}-234579k`,
    name: "Olivia Kapoor",
    email: `${ID}-234579k@email.com`,
  },
  {
    id: `${ID}-234580h`,
    name: "Mateo Hernandez",
    email: `${ID}-234580h@email.com`,
  },
];

export const evaluator__student = (ID: string): StableUser => ({
  id: `${ID}-234581p`,
  name: "Student Evaluator",
  email: `${ID}-234581p@email.com`,
});

const allStudents = (ID: string): StableUser[] => [
  ...dummy__students(ID),
  evaluator__student(ID),
];

export const allUsers = (ID: string): StableUser[] => [
  evaluator__groupAdmin(ID),
  evaluator__subGroupAdmin(ID),
  ...allSupervisors(ID),
  ...allStudents(ID),
];

const supervisorCapacities = (
  ID: string,
): (Pick<
  SupervisorInstanceDetails,
  | "projectAllocationLowerBound"
  | "projectAllocationTarget"
  | "projectAllocationUpperBound"
> & { userId: string })[] => [
  {
    userId: allSupervisors(ID)[0].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 1,
    projectAllocationUpperBound: 3,
  },
  {
    userId: allSupervisors(ID)[1].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 2,
    projectAllocationUpperBound: 3,
  },
  {
    userId: allSupervisors(ID)[2].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 2,
    projectAllocationUpperBound: 3,
  },
  {
    userId: allSupervisors(ID)[3].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 2,
    projectAllocationUpperBound: 3,
  },
  {
    userId: allSupervisors(ID)[4].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 2,
    projectAllocationUpperBound: 3,
  },
];

const allocationInstance = {
  id: "playground",
  displayName: "Playground",
};

const allocationSubGroup = {
  id: "lvl-4-and-lvl-5-honours",
  displayName: "Level 4 & Level 5 Honours",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const allocationGroup = (ID: string) => ({
  id: `socs`,
  displayName: `School of Computing Science`,
});

const instanceId = (ID: string) => ({
  allocationGroupId: allocationGroup(ID).id,
  allocationInstanceId: allocationInstance.id,
  allocationSubGroupId: allocationSubGroup.id,
});

const inInstance = <T>(ID: string, data: T) => ({
  ...instanceId(ID),
  ...data,
});

export const test__flagTitles: Pick<Flag, "title">[] = [
  { title: "Level 4" },
  { title: "Level 5" },
  { title: "Software Engineering" },
] as const;

export const test__tagTitles: Pick<Tag, "title">[] = [
  { title: "Python" },
  { title: "Java" },
  { title: "C++" },
  { title: "JavaScript" },
  { title: "Ruby" },
  { title: "PHP" },
  { title: "HTML/CSS" },
  { title: "Artificial Intelligence" },
  { title: "Machine Learning" },
  { title: "Data Science" },
  { title: "Web Development" },
  { title: "Mobile App Development" },
  { title: "Cybersecurity" },
  { title: "Databases" },
  { title: "Cloud Computing" },
  { title: "DevOps" },
  { title: "Natural Language Processing" },
  { title: "Computer Vision" },
  { title: "Game Development" },
] as const;

// dependant

export const invites = (ID: string): Invitation[] => [
  inInstance(ID, { email: evaluator__groupAdmin(ID).email! }),
  inInstance(ID, { email: evaluator__subGroupAdmin(ID).email! }),
  ...dummy__supervisors(ID).map((s) => inInstance(ID, { email: s.email! })),
  ...dummy__students(ID).map((s) => inInstance(ID, { email: s.email! })),
];

export const sampleGroup = (ID: string): AllocationGroup => ({
  id: allocationGroup(ID).id,
  displayName: allocationGroup(ID).displayName,
});

export const sampleSubGroup = (ID: string): AllocationSubGroup => ({
  id: allocationSubGroup.id,
  allocationGroupId: allocationGroup(ID).id,
  displayName: allocationSubGroup.displayName,
});

export const sampleInstance = (ID: string): AllocationInstance => ({
  id: allocationInstance.id,
  allocationGroupId: allocationGroup(ID).id,
  allocationSubGroupId: allocationSubGroup.id,
  displayName: allocationInstance.displayName,
  stage: Stage.SETUP,
  projectSubmissionDeadline: subDays(new Date(), 1),
  preferenceSubmissionDeadline: addDays(new Date(), 7),
  minPreferences: 6,
  maxPreferences: 6,
  maxPreferencesPerSupervisor: 2,
  selectedAlgName: null,
  parentInstanceId: null,
  supervisorAllocationAccess: false,
  studentAllocationAccess: false,
});

export const adminsInSpaces = (ID: string): New<AdminInSpace>[] => [
  {
    userId: evaluator__groupAdmin(ID).id,
    allocationGroupId: allocationGroup(ID).id,
    allocationSubGroupId: null,
    adminLevel: AdminLevel.GROUP,
  },
  {
    userId: evaluator__subGroupAdmin(ID).id,
    allocationGroupId: allocationGroup(ID).id,
    allocationSubGroupId: allocationSubGroup.id,
    adminLevel: AdminLevel.SUB_GROUP,
  },
];

const supervisors__userInInstance = (ID: string): UserInInstance[] =>
  allSupervisors(ID).map(({ id }) =>
    inInstance(ID, {
      userId: id,
      role: Role.SUPERVISOR,
      joined: true,
    }),
  );

const students__userInInstance = (ID: string): UserInInstance[] =>
  dummy__students(ID).map(({ id }) =>
    inInstance(ID, {
      userId: id,
      role: Role.STUDENT,
      joined: true,
    }),
  );

const evaluator__student__userInInstance = (ID: string): UserInInstance =>
  inInstance(ID, {
    userId: evaluator__student(ID).id,
    role: Role.STUDENT,
    joined: true,
  });

export const allUsersInInstance = (ID: string): UserInInstance[] => [
  ...supervisors__userInInstance(ID),
  ...students__userInInstance(ID),
  evaluator__student__userInInstance(ID),
];

export const studentDetails = (ID: string): StudentDetails[] => [
  ...dummy__students(ID).map(({ id }, i) =>
    inInstance(ID, {
      userId: id,
      submittedPreferences: true,
      latestSubmissionDateTime: new Date(),
      studentLevel: i === 0 ? 5 : 4,
    }),
  ),
  inInstance(ID, {
    userId: evaluator__student(ID).id,
    submittedPreferences: true,
    latestSubmissionDateTime: new Date(),
    studentLevel: 4,
  }),
];

export const capacities = (ID: string): SupervisorInstanceDetails[] =>
  supervisorCapacities(ID).map((s) => inInstance(ID, s));

export const projects = (ID: string): Project[] =>
  projectData(ID).map((p) =>
    inInstance(ID, {
      id: p.id,
      title: p.title,
      description: p.description,
      supervisorId: allSupervisors(ID)[p.supervisorId].id,
      preAllocatedStudentId: null,
      specialTechnicalRequirements: null,
      latestEditDateTime: subDays(new Date(), 7),
      capacityLowerBound: 0,
      capacityUpperBound: 1,
    }),
  );

export const preferences = (ID: string): Preference[] =>
  preferenceData(ID).map((p) =>
    inInstance(ID, {
      projectId: p.projectId,
      userId: allStudents(ID)[p.studentIdx].id,
      rank: p.studentRanking,
      type: PreferenceType.PREFERENCE,
    }),
  );

export const savedPreferences = (ID: string): SavedPreference[] =>
  preferenceData(ID).map((p) =>
    inInstance(ID, {
      projectId: p.projectId,
      userId: allStudents(ID)[p.studentIdx].id,
      rank: p.studentRanking,
    }),
  );

export const flags = (ID: string): Flag[] =>
  test__flagTitles.map(({ title }) =>
    inInstance(ID, { id: slugify(ID + title), title }),
  );

export const flagsOnProjects = (ID: string): FlagOnProject[] =>
  projectData(ID).flatMap((p) =>
    p.flags.map((f) => ({
      projectId: p.id,
      flagId: slugify(ID + f.title),
    })),
  );

export const tags = (ID: string): Tag[] =>
  test__tagTitles.map(({ title }) =>
    inInstance(ID, { id: slugify(ID + title), title }),
  );

export const tagsOnProjects = (ID: string): TagOnProject[] =>
  projectData(ID).flatMap((p) =>
    p.tags.map((t) => ({
      projectId: p.id,
      tagId: slugify(ID + t.title),
    })),
  );

const builtInAlgorithms = [
  GenerousAlgorithm,
  GreedyAlgorithm,
  MinCostAlgorithm,
  GreedyGenAlgorithm,
];

export const algorithms = (ID: string) =>
  builtInAlgorithms.map((alg) =>
    inInstance(ID, {
      ...alg,
      matchingResultData: JSON.stringify({}),
    }),
  );
