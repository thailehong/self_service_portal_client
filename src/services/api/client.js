import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

let accessToken = null;
let refreshHandler = null;
let refreshPromise = null;

export const tokenManager = {
  getAccessToken: () => accessToken,
  setAccessToken: (token) => {
    accessToken = token;
  },
  clearAccessToken: () => {
    accessToken = null;
  },
};

export function registerRefreshHandler(handler) {
  refreshHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.config?.headers?.Authorization) {
      delete error.config.headers.Authorization;
    }

    if (error?.response?.config?.headers?.Authorization) {
      delete error.response.config.headers.Authorization;
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint || !refreshHandler) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshHandler().finally(() => {
        refreshPromise = null;
      });

      await refreshPromise;
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenManager.clearAccessToken();
      return Promise.reject(refreshError);
    }
  }
);
