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

export function normalizeUser(user) {
  return {
    ...user,
    username: user?.Username ?? user?.username ?? "",
    employeeId: user?.EmployeeID ?? user?.employeeID ?? user?.employeeId ?? "",
    jobTitle: user?.JobTitle ?? user?.jobTitle ?? "",
    email: user?.Email ?? user?.email ?? "",
    displayName: user?.DisplayName ?? user?.displayName ?? "",
    lineManager: user?.LineManager ?? user?.lineManager ?? "",
    department: user?.Department ?? user?.department ?? "",
    location: user?.Location ?? user?.location ?? "",
    company: user?.Company ?? user?.company ?? "",
    phoneNumber: user?.PhoneNumber ?? user?.phoneNumber ?? "",
    costCenter: user?.CostCenter ?? user?.costCenter ?? "",
    ccn: user?.CCN ?? user?.ccn ?? "",
    bu: user?.BU ?? user?.bu ?? "",
    isActive: Boolean(user?.IsActive ?? user?.isActive),
    createdAt: user?.CreatedAt ?? user?.createdAt ?? null,
    updatedAt: user?.UpdatedAt ?? user?.updatedAt ?? null,
    roles: user?.Roles ?? user?.roles ?? [],
  };
}

export const userApi = {
  async getAllUsers() {
    const { data } = await apiClient.get("/users");
    return unwrapCollection(data).map(normalizeUser);
  },

  async createUserByEmployeeId(employeeId) {
    const { data } = await apiClient.post("/users", {
      EmployeeID: employeeId.trim(),
    });

    return data;
  },
};
