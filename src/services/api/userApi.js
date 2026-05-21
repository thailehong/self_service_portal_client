import { apiClient } from "./client";

export const userApi = {
  async createUserByEmployeeId(employeeId) {
    const { data } = await apiClient.post("/users", {
      EmployeeID: employeeId.trim(),
    });

    return data;
  },
};
