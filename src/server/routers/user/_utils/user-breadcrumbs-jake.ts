import { type PrismaClient } from "@prisma/client";
import {
  authoriseLastSegment,
  exampleRoutingConfiguration,
  makePermission,
  PERMISSIONS,
} from "./breadcrumbs-v2";

import { partitionSpaces } from "@/server/utils/space/partition";
import { isSuperAdmin } from "@/server/utils/admin/is-super-admin";

export async function validateSegments(
  db: PrismaClient,
  segments: string[],
  userId: string,
) {
  if (segments.length === 0) return [];

  const userPermsSet = await getUserPerms(db, userId);

  return segments.map((segment, i) => ({
    segment,
    access: authoriseLastSegment(
      exampleRoutingConfiguration,
      segments.slice(0, i + 1),
      userPermsSet,
    ),
  }));
}

// TODO implement this.
async function getUserPerms(
  db: PrismaClient,
  userId: string,
): Promise<Set<string>> {
  const superAdmin = await isSuperAdmin(db, userId);
  if (superAdmin) return new Set([PERMISSIONS.superAdmin]);

  const spaces = await db.adminInSpace.findMany({ where: { userId } });

  const { groups, subGroups } = partitionSpaces(spaces);

  const adminGroups = groups.map((g) => ({ "[group]": g.group }));

  const adminSubGroups = subGroups.map((s) => ({ "[subgroup]": s.subGroup }));

  const segmentMapping = {
    "[group]": "groupwow",
    "[subgroup]": "subgroup-wower",
    "[instance]": "instance-socks",
    "[pid]": "project-SPA",
  };

  const projectOwnerPerm = makePermission(
    PERMISSIONS.projectOwner,
    segmentMapping,
  );

  const supervisorPerm = makePermission(PERMISSIONS.supervisor, segmentMapping);

  return new Set([projectOwnerPerm, supervisorPerm]);
}

function main() {
  validateSegments(
    // @ts-expect-error dont worry
    undefined,
    [
      "groupwow",
      "subgroup-wower",
      "instance-socks",
      "projects",
      "project-SPA",
      "edit",
    ],
    "userMe",
  ).then((e) => console.log(e));
}

main();
