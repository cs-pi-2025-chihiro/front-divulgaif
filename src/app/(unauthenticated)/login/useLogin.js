import { useMutation } from "@tanstack/react-query";
import api from "../../../services/utils/api";
import { ENDPOINTS } from "../../../enums/endpoints";

const loginUser = async (credentials) => {
  const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));

        if (data.user.roles && Array.isArray(data.user.roles)) {
          const roleNames = data.user.roles.map((role) => role.name);

          localStorage.setItem("userRoles", JSON.stringify(roleNames));
        }
      }
    },

    onError: (error) => {
      console.error("Login failed:", error.response?.data || error.message);
    },
  });
};
