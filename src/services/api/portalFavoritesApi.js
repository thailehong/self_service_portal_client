import { apiClient } from "./client";

export const portalFavoritesApi = {
  async getFavorites() {
    const { data } = await apiClient.get("/PortalFavorites");
    return Array.isArray(data) ? data : [];
  },

  async addFavorite(applicationId) {
    await apiClient.post(`/PortalFavorites/${encodeURIComponent(applicationId)}`);
  },

  async removeFavorite(applicationId) {
    await apiClient.delete(`/PortalFavorites/${encodeURIComponent(applicationId)}`);
  },
};
