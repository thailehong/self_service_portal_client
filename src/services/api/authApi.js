import { apiClient } from "./client";

export const authApi = {
  async login(payload) {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
  },
  async register(payload) {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },
  async refresh() {
    const { data } = await apiClient.post("/auth/refresh");
    return data;
  },
  async currentUser() {
    const { data } = await apiClient.get("/users/me");
    return data;
  },
  async logout() {
    await apiClient.post("/auth/logout");
  },
};
