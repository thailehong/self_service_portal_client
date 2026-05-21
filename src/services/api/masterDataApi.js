import { apiClient } from "./client";

const masterDataBasePath = "/MasterData";

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

export function normalizeHOD(hod) {
  return {
    ...hod,
    email: hod?.Email ?? hod?.email ?? "",
    fullName: hod?.FullName ?? hod?.fullName ?? "",
    kronosDeptId:
      hod?.KronosDeptID ?? hod?.kronosDeptID ?? hod?.kronosDeptId ?? "",
  };
}

export const masterDataApi = {
  async getHOD() {
    const { data } = await apiClient.get(`${masterDataBasePath}/hod`);
    return unwrapCollection(data).map(normalizeHOD);
  },
};
