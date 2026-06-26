import { apiClient } from "./client";

export const dmsAutoLoginApi = {
  async buildUrl(returnUrl, target) {
    const { data } = await apiClient.get("/DmsAutoLogin/url", {
      params: { returnUrl, target },
    });

    return data?.url || data?.Url || "";
  },
};
