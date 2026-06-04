import { apiClient } from "./client";

function unwrapCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  if (Array.isArray(data?.value)) {
    return data.value;
  }

  return [];
}

export function normalizeRole(role) {
  const id =
    role?.ID ?? role?.id ?? role?.roleId ?? role?.roleID ?? role?.value;
  const roleName =
    role?.Name ??
    role?.name ??
    role?.roleName ??
    role?.role ??
    role?.description ??
    (id !== undefined && id !== null ? `Role ${id}` : "Unknown role");

  return {
    ...role,
    id: Number.isFinite(Number(id)) ? Number(id) : id,
    roleName: String(roleName),
    site: role?.Site ?? role?.site ?? "",
    bu: role?.BU ?? role?.bu ?? "",
    department: role?.Department ?? role?.department ?? "",
  };
}

function normalizeRoleAssignment(item) {
  const id = item?.ID ?? item?.id;
  const roleId = item?.RoleId ?? item?.roleId;
  const roleName = item?.Role ?? item?.role ?? item?.roleName ?? "";

  return {
    id: Number.isFinite(Number(id)) ? Number(id) : id,
    userName: item?.UserName ?? item?.userName ?? "",
    roleId: Number.isFinite(Number(roleId)) ? Number(roleId) : roleId,
    roleName: String(roleName),
    site: item?.Site ?? item?.site ?? "",
    bu: item?.BU ?? item?.bu ?? "",
    department: item?.Department ?? item?.department ?? "",
  };
}

export const roleApi = {
  async getRoles() {
    const { data } = await apiClient.get("/roles");
    return unwrapCollection(data).map(normalizeRole);
  },

  async createRole(payload) {
    const { data } = await apiClient.post("/roles", {
      Name: payload.name,
      Site: payload.site,
      BU: payload.bu,
      Department: payload.department,
    });

    return normalizeRole(data);
  },

  async updateRole(id, payload) {
    const { data } = await apiClient.put(`/roles/${encodeURIComponent(id)}`, {
      Name: payload.name,
      Site: payload.site,
      BU: payload.bu,
      Department: payload.department,
    });

    return normalizeRole(data);
  },

  async assignRole({ username, roleId }) {
    const trimmedUsername = username.trim();
    const { data } = await apiClient.post("/roles/assign", {
      UserName: trimmedUsername,
      RoleId: Number(roleId),
    });

    return data;
  },

  async assignUserRoles({ username, roleIds }) {
    const results = [];

    for (const roleId of roleIds) {
      results.push(await roleApi.assignRole({ username, roleId }));
    }

    return results;
  },

  async getUserRoles(username) {
    const encodedUsername = encodeURIComponent(username.trim());
    const { data } = await apiClient.get(`/roles/user/${encodedUsername}`);
    return unwrapCollection(data);
  },

  async getRoleAssignments() {
    const { data } = await apiClient.get("/roles/assignments");
    return unwrapCollection(data).map(normalizeRoleAssignment);
  },

  async updateRoleAssignment({ id, username, roleId }) {
    const { data } = await apiClient.put(
      `/roles/assignments/${encodeURIComponent(id)}`,
      {
        UserName: username.trim(),
        RoleId: Number(roleId),
      },
    );

    return data;
  },

  async deleteRoleAssignment(id) {
    await apiClient.delete(`/roles/assignments/${encodeURIComponent(id)}`);
  },

  async unassignRole({ username, roleId }) {
    const { data } = await apiClient.delete("/roles/unassign", {
      data: {
        UserName: username.trim(),
        RoleId: Number(roleId),
      },
    });

    return data;
  },
};
