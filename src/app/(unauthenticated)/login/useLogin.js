import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../../constants";
import axios from "axios";

const loginUser = async (credentials) => {
  const response = await axios.post(
    BASE_URL + "/api/v1/auth/login",
    credentials,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
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
