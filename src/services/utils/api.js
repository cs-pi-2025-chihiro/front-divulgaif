import axios from "axios";
import { BASE_URL } from "../../constants";

export const api = axios.create({
  baseURL: BASE_URL,

  headers: { "Content-Type": "application/json" },

  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

const refreshToken = async () => {
  const currentRefreshToken = localStorage.getItem("refreshToken");

  if (!currentRefreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/auth/refresh-token`,

      {
        refreshToken: currentRefreshToken,
      },

      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);

      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      return response.data.accessToken;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);

    localStorage.removeItem("accessToken");

    localStorage.removeItem("refreshToken");

    localStorage.removeItem("userData");

    localStorage.removeItem("userRoles");
  }

  return null;
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/v1/auth/login" &&
      originalRequest.url !== "/api/v1/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      const newAccessToken = await refreshToken();

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      }

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
