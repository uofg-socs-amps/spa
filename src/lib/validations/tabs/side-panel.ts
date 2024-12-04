import { AllocationInstance, Role, Stage } from "@prisma/client";

import { TabGroup } from "./index";

import { pages } from "@/content/pages";

function adminOnlyTabs<
  T extends {
    stage: Stage;
    parentInstanceId: string | null;
    forkedInstanceId: string | null;
  },
>(instance: T) {
  const branchingTab = getInstanceBranchingTab(instance);
  const tabs = {
    [Stage.SETUP]: [pages.addStudents, pages.addSupervisors],

    [Stage.PROJECT_SUBMISSION]: [
      pages.supervisorInvites,
      pages.projectSubmissions,
      pages.preAllocatedProjects,
      pages.addStudents,
      pages.addSupervisors,
    ],
    [Stage.PROJECT_SELECTION]: [
      pages.studentInvites,
      pages.preferenceSubmissions,
      pages.lateProposals,
      pages.preAllocatedProjects,
      pages.addStudents,
      pages.addSupervisors,
    ],
    [Stage.PROJECT_ALLOCATION]: [
      pages.algorithms,
      pages.results,
      pages.preferenceStatistics,
      pages.preferenceSubmissions,
      pages.preAllocatedProjects,
    ],
    [Stage.ALLOCATION_ADJUSTMENT]: [
      pages.manualChanges,
      pages.randomAllocations,
      pages.results,
      pages.preferenceStatistics,
      pages.preferenceSubmissions,
      pages.preAllocatedProjects,
    ],
    [Stage.ALLOCATION_PUBLICATION]: [
      pages.manageUserAccess,
      pages.allocationOverview,
      pages.exportToCSV,
      ...branchingTab,
      pages.preferenceStatistics,
      pages.preferenceSubmissions,
    ],
  };
  return tabs[instance.stage];
}

function supervisorOnlyTabs(instance: AllocationInstance) {
  const myAllocationsTab = instance.supervisorAllocationAccess
    ? [pages.myAllocations]
    : [];

  const tabs = {
    [Stage.SETUP]: [],
    [Stage.PROJECT_SUBMISSION]: [pages.myProjects, pages.newProject],
    [Stage.PROJECT_SELECTION]: [pages.myProjects, pages.newProject],
    [Stage.PROJECT_ALLOCATION]: [pages.myProjects],
    [Stage.ALLOCATION_ADJUSTMENT]: [pages.myProjects],
    [Stage.ALLOCATION_PUBLICATION]: [
      pages.myProjects,
      ...myAllocationsTab,
      pages.readerProjects,
    ],
  };
  return tabs[instance.stage];
}

const studentOnlyTabs = (
  instance: AllocationInstance,
  preAllocatedProject: boolean,
) => {
  const base = preAllocatedProject ? [] : [pages.myPreferences];

  const myAllocationTab = instance.studentAllocationAccess
    ? [pages.myAllocation]
    : [];

  const tabs = {
    [Stage.SETUP]: [],
    [Stage.PROJECT_SUBMISSION]: [],
    [Stage.PROJECT_SELECTION]: base,
    [Stage.PROJECT_ALLOCATION]: base,
    [Stage.ALLOCATION_ADJUSTMENT]: base,
    [Stage.ALLOCATION_PUBLICATION]: myAllocationTab,
  };
  return tabs[instance.stage];
};

export function getTabs({
  roles,
  instance,
  preAllocatedProject,
}: {
  roles: Set<Role>;
  instance: AllocationInstance & { forkedInstanceId: string | null };
  preAllocatedProject: boolean;
}): TabGroup[] {
  const tabs = [];

  if (roles.has(Role.ADMIN)) {
    tabs.push({
      title: "Admin",
      tabs: [pages.stageControl, pages.settings],
    });

    tabs.push({
      title: "Stage-specific",
      tabs: adminOnlyTabs(instance),
    });
  }

  if (roles.has(Role.SUPERVISOR)) {
    const isSecondRole = roles.size > 1;
    const base = supervisorOnlyTabs(instance);

    tabs.push({
      title: "Supervisor",
      tabs: !isSecondRole
        ? [pages.instanceTasks, ...base]
        : instance.stage === Stage.SETUP
          ? base
          : [pages.supervisorTasks, ...base],
    });
  }

  if (roles.has(Role.STUDENT)) {
    const isSecondRole = roles.size > 1;
    const base = studentOnlyTabs(instance, preAllocatedProject);

    tabs.push({
      title: "Student",
      tabs: isSecondRole ? base : [pages.instanceTasks, ...base],
    });
  }

  return tabs;
}

function getInstanceBranchingTab<
  T extends {
    parentInstanceId: string | null;
    forkedInstanceId: string | null;
  },
>(instance: T) {
  if (instance.parentInstanceId) return [pages.mergeInstance];
  if (!instance.forkedInstanceId) return [pages.forkInstance];
  return [];
}
