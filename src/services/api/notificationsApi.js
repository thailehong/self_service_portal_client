import { apiClient } from './client';

export const notificationsApi = {
  async getAll(params = {}) {
    const { data } = await apiClient.get('/notifications', { params });
    return data;
  },
  async markAsRead(id) {
    await apiClient.put(`/notifications/${id}/read`);
  },
};
