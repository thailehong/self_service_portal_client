export const ADMINISTRATOR_ROLE_IDS = [3, 5];

function extractRoleId(role) {
  if (role === null || role === undefined) {
    return null;
  }

  if (typeof role === "number") {
    return Number.isFinite(role) ? role : null;
  }

  if (typeof role === "string") {
    const numericRole = Number(role);
    return Number.isFinite(numericRole) ? numericRole : null;
  }

  if (typeof role !== "object") {
    return null;
  }

  const rawRoleId =
    role.ID ??
    role.id ??
    role.RoleId ??
    role.roleId ??
    role.roleID ??
    role.Role?.ID ??
    role.role?.id ??
    role.value ??
    role.key;

  return extractRoleId(rawRoleId);
}

export function getUserRoleIds(user) {
  if (!user || typeof user !== "object") {
    return [];
  }

  const roleSources = [
    user.Roles,
    user.roles,
    user.RoleIds,
    user.roleIds,
    user.RoleIDs,
    user.roleIDs,
    user.RoleId,
    user.roleId,
    user.RoleID,
    user.roleID,
    user.Role,
    user.role,
  ];

  return [
    ...new Set(
      roleSources
        .flatMap((source) => (Array.isArray(source) ? source : [source]))
        .map(extractRoleId)
        .filter((roleId) => roleId !== null),
    ),
  ];
}

export function hasAnyRole(user, allowedRoleIds) {
  const userRoleIds = getUserRoleIds(user);
  const allowedRoleIdSet = new Set(allowedRoleIds);

  return userRoleIds.some((roleId) => allowedRoleIdSet.has(roleId));
}

export function canAccessAdministrator(user) {
  return hasAnyRole(user, ADMINISTRATOR_ROLE_IDS);
}
