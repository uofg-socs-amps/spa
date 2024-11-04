type Config = Record<string, PermissionTemplate[]>;

/**
 * Checks if the user has permission to access the *last segment* in a provided route
 * @param config A route permissions configuration
 * @param route The route the users is trying to access
 * @param available_perms The permissions the user has
 * @returns `hasPermission` - weather the user has permission
 */
export function authoriseLastSegment(
  config: Config,
  route: string[],
  available_perms_set: Set<string>,
) {
  const res = match(config, route);
  if (!res.success) return false;

  const { rule } = res;

  const allowable_perms_set = new Set(expandPermissions(config, rule, route));

  const intersection = allowable_perms_set.intersection(available_perms_set);
  return intersection.size > 0;
}

function match(config: Config, route: string[]) {
  for (const rule of Object.keys(config)) {
    const ruleSegments = rule.split("/");

    if (ruleSegments.length !== route.length) continue;

    const ruleMatches = ruleSegments.every((segment, i) => {
      // is this a parametrised segment e.g. [group]
      if (/^\[.+\]$/.test(segment)) return true;

      return segment === route[i];
    });

    if (ruleMatches) return { success: true, rule } as const;
  }
  // unmatched route
  return { success: false } as const;
}

function expandPermissions(
  config: Config,
  rule: string,
  route: string[],
): string[] {
  const permissionTemplates = config[rule];
  const segmentMapping: Record<string, string> = rule
    .split("/")
    .reduce((mapping, ruleSegment, i) => {
      if (/^\[.+\]$/.test(ruleSegment))
        return { ...mapping, [ruleSegment]: route[i] };
      else return mapping;
    }, {});

  return permissionTemplates.map((template) =>
    makePermission(template, segmentMapping),
  );
}

export function makePermission(
  perm: PermissionTemplate,
  segmentMapping: Record<string, string>,
) {
  // Consider: use reduce?
  let res = perm as string;
  for (const [name, value] of Object.entries(segmentMapping))
    res = res.replace(name, value);

  return res;
}

type PermissionTemplate = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// A permission is just a string that uniquely identifies a permission.
// a permission template is parametrised
// parameters are surrounded in square brackets, e.g.  `[group]`.
// They will be replaced by the segment of the same name.
export const PERMISSIONS = {
  superAdmin: "super-admin",
  groupAdmin: "group-admin-[group]",
  subgroupAdmin: "subgroup-admin-[group]-[subgroup]",
  instanceAdmin: "instance-admin-[group]-[subgroup]-[instance]",
  student: "student-[group]-[subgroup]-[instance]",
  supervisor: "supervisor-[group]-[subgroup]-[instance]",
  projectOwner: "project-owner-[group]-[subgroup]-[instance]-[pid]",
} as const;

// A routing config maps a route template
// to a list of permission templates
// a route template is a `/` separated list of segments
// a segment can either be a literal - which must match exactly
// or a parameter - which will match anything.
// parameters are surrounded with square brackets, for example `[group]`.
export const exampleRoutingConfiguration = {
  "[group]/[subgroup]/[instance]": [
    PERMISSIONS.superAdmin,
    PERMISSIONS.groupAdmin,
    PERMISSIONS.subgroupAdmin,
    PERMISSIONS.instanceAdmin,
    PERMISSIONS.student,
    PERMISSIONS.supervisor,
  ],
  "[group]/[subgroup]/[instance]/projects/[pid]/edit": [
    PERMISSIONS.superAdmin,
    PERMISSIONS.groupAdmin,
    PERMISSIONS.subgroupAdmin,
    PERMISSIONS.instanceAdmin,
    PERMISSIONS.projectOwner,
  ],
};
