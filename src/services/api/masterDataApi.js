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

function normalizeSite(site) {
  return {
    id: site?.SiteID ?? site?.siteID ?? site?.siteId,
    siteId: site?.SiteID ?? site?.siteID ?? site?.siteId,
    siteCode: site?.SiteCode ?? site?.siteCode ?? "",
    siteName: site?.SiteName ?? site?.siteName ?? "",
  };
}

function normalizeCcn(ccn) {
  return {
    id: ccn?.CCN ?? ccn?.ccn ?? ccn?.Code ?? ccn?.code,
    ccn: ccn?.CCN ?? ccn?.ccn ?? "",
    code: ccn?.Code ?? ccn?.code ?? "",
    name: ccn?.Name ?? ccn?.name ?? "",
    siteId: ccn?.SiteID ?? ccn?.siteID ?? ccn?.siteId,
  };
}

function normalizeDepartment(department) {
  return {
    id:
      department?.KronosDeptID ??
      department?.kronosDeptID ??
      department?.kronosDeptId ??
      department?.KronosDeptName ??
      department?.kronosDeptName,
    kronosDeptId:
      department?.KronosDeptID ??
      department?.kronosDeptID ??
      department?.kronosDeptId ??
      "",
    kronosDeptName:
      department?.KronosDeptName ?? department?.kronosDeptName ?? "",
    ccn: department?.CCN ?? department?.ccn ?? "",
    kronosCode: department?.KronosCode ?? department?.kronosCode ?? "",
    kronosName: department?.KronosName ?? department?.kronosName ?? "",
  };
}

export const masterDataApi = {
  async getSites() {
    const { data } = await apiClient.get(`${masterDataBasePath}/sites`);
    return unwrapCollection(data).map(normalizeSite);
  },

  async getCcnsBySite(siteId) {
    const { data } = await apiClient.get(
      `${masterDataBasePath}/ccns/site/${encodeURIComponent(siteId)}`,
    );
    return unwrapCollection(data).map(normalizeCcn);
  },

  async getDepartmentsByCcn(ccn) {
    const { data } = await apiClient.get(
      `${masterDataBasePath}/departments/ccn/${encodeURIComponent(ccn)}`,
    );
    return unwrapCollection(data).map(normalizeDepartment);
  },

  async getHOD() {
    const { data } = await apiClient.get(`${masterDataBasePath}/hod`);
    return unwrapCollection(data).map(normalizeHOD);
  },
};
