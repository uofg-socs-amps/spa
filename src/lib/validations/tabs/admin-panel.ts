import { AllocationInstance, Role, Stage } from "@prisma/client";

import { TabGroup } from "./index";
import { instanceTabs as userTabs } from "./instance";

export const adminTabs = {
  settings: {
    title: "Settings",
    href: "settings",
    icon: "settings",
  },
  stageControl: {
    title: "Stage Control",
    href: "",
    icon: "layers",
  },
  addSupervisors: {
    title: "Add Supervisors",
    href: "add-supervisors",
    icon: "user-plus",
  },
  addStudents: {
    title: "Add Students",
    href: "add-students",
    icon: "user-plus",
  },
  supervisorInvites: {
    title: "Supervisor Invites",
    href: "supervisor-invites",
    icon: "users",
  },
  projectSubmissions: {
    title: "Project Submissions",
    href: "project-submissions",
    icon: "folder",
  },
  studentInvites: {
    title: "Student Invites",
    href: "student-invites",
    icon: "users",
  },
  preferenceSubmissions: {
    title: "Preference Submissions",
    href: "preference-submissions",
    icon: "folder-heart",
  },
  lateProposals: {
    title: "Late Proposals",
    href: "late-proposals",
    icon: "folder-clock",
  },
  algorithmsOverview: {
    title: "Algorithms",
    href: "algorithms",
    icon: "server",
  },
  algorithmDetails: {
    title: "Results",
    href: "results",
    icon: "square-kanban",
  },
  manualChanges: {
    title: "Manual Changes",
    href: "manual-changes",
    icon: "mouse-pointer",
  },
  allocationOverview: {
    title: "Allocation Overview",
    href: "allocation-overview",
    icon: "folder-lock",
  },
  forkInstance: {
    title: "Fork Instance",
    href: "fork-instance",
    icon: "split",
  },
  mergeInstance: {
    title: "Merge Instance",
    href: "merge-instance",
    icon: "merge",
  },
  exportToCSV: {
    title: "Export to CSV",
    href: "export-to-csv",
    icon: "file-spreadsheet",
  },
  exportToExternalSystem: {
    title: "Send Data to External System",
    href: "export-to-external-system",
    icon: "folder-output",
  },
  supervisorTasks: {
    title: "Tasks",
    href: "supervisor-tasks",
    icon: "list-checks",
  },
};

const adminOnlyTabs = (parentInstanceId: string | null) => ({
  [Stage.SETUP]: [adminTabs.addStudents, adminTabs.addSupervisors],
  [Stage.PROJECT_SUBMISSION]: [
    adminTabs.supervisorInvites,
    adminTabs.projectSubmissions,
  ],
  [Stage.PROJECT_SELECTION]: [
    adminTabs.studentInvites,
    adminTabs.preferenceSubmissions,
    adminTabs.lateProposals,
  ],
  [Stage.PROJECT_ALLOCATION]: [
    adminTabs.algorithmsOverview,
    adminTabs.algorithmDetails,
  ],
  [Stage.ALLOCATION_ADJUSTMENT]: [adminTabs.manualChanges],
  [Stage.ALLOCATION_PUBLICATION]: [
    adminTabs.allocationOverview,
    adminTabs.exportToCSV,
    !parentInstanceId ? adminTabs.forkInstance : adminTabs.mergeInstance,
  ],
});

const superVisorOnlyTabs = {
  [Stage.SETUP]: [],
  [Stage.PROJECT_SUBMISSION]: [userTabs.myProjects, userTabs.newProject],
  [Stage.PROJECT_SELECTION]: [userTabs.myProjects, userTabs.newProject],
  [Stage.PROJECT_ALLOCATION]: [userTabs.myProjects],
  [Stage.ALLOCATION_ADJUSTMENT]: [userTabs.myProjects],
  [Stage.ALLOCATION_PUBLICATION]: [userTabs.myProjects, userTabs.myAllocations],
};

const studentOnlyTabs = (preAllocatedProject: boolean) => {
  const base = preAllocatedProject ? [] : [userTabs.myPreferences];
  return {
    [Stage.SETUP]: [],
    [Stage.PROJECT_SUBMISSION]: [],
    [Stage.PROJECT_SELECTION]: base,
    [Stage.PROJECT_ALLOCATION]: base,
    [Stage.ALLOCATION_ADJUSTMENT]: base,
    [Stage.ALLOCATION_PUBLICATION]: [userTabs.myAllocation],
  };
};

export function getTabs({
  roles,
  instance,
  preAllocatedProject,
}: {
  roles: Set<Role>;
  instance: AllocationInstance;
  preAllocatedProject: boolean;
}): TabGroup[] {
  const tabs = [];

  if (roles.has(Role.ADMIN)) {
    tabs.push({
      title: "Admin",
      tabs: [adminTabs.stageControl, adminTabs.settings],
    });
    tabs.push({
      title: "Stage-specific",
      tabs: adminOnlyTabs(instance.parentInstanceId)[instance.stage],
    });
  }

  if (roles.has(Role.SUPERVISOR)) {
    const isSecondRole = roles.size > 1;
    const base = superVisorOnlyTabs[instance.stage];

    tabs.push({
      title: "Supervisor",
      tabs: !isSecondRole
        ? [userTabs.instanceTasks, ...base]
        : instance.stage === Stage.SETUP
          ? base
          : [adminTabs.supervisorTasks, ...base],
    });
  }

  if (roles.has(Role.STUDENT)) {
    const isSecondRole = roles.size > 1;
    const base = studentOnlyTabs(preAllocatedProject)[instance.stage];

    tabs.push({
      title: "Student",
      tabs: isSecondRole ? base : [userTabs.instanceTasks, ...base],
    });
  }

  return tabs;
}