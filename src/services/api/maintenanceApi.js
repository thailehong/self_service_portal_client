import { apiClient } from "./client";

const DEFAULT_TITLE = "DMS Portal is under maintenance";
const DEFAULT_MESSAGE = "The portal is temporarily unavailable. Please try again later.";

function normalizeMaintenanceStatus(data = {}) {
  return {
    maintenanceEnable: Boolean(data.maintenanceEnable ?? data.MaintenanceEnable),
    maintenanceTitle: String(data.maintenanceTitle ?? data.MaintenanceTitle ?? DEFAULT_TITLE),
    maintenanceMessage: String(data.maintenanceMessage ?? data.MaintenanceMessage ?? DEFAULT_MESSAGE),
    updatedAtUtc: data.updatedAtUtc ?? data.UpdatedAtUtc ?? null,
  };
}

export const maintenanceApi = {
  async getStatus() {
    const { data } = await apiClient.get("/Maintenance/status", {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return normalizeMaintenanceStatus(data);
  },

  async updateSettings(payload) {
    const { data } = await apiClient.put("/Maintenance/settings", {
      maintenanceEnable: Boolean(payload.maintenanceEnable),
      maintenanceTitle: payload.maintenanceTitle,
      maintenanceMessage: payload.maintenanceMessage,
    });
    return normalizeMaintenanceStatus(data);
  },
};
