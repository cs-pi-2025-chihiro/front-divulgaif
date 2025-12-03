import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../../services/utils/api";
import { ENDPOINTS } from "../../../enums/endpoints";

const changePassword = async ({ token, password }) => {
  const response = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
    token,
    password,
  });
  return response.data;
};

export const useChangePassword = (setSuccessResult, setErrorResult) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      console.log("Change password successful:", data);
      setSuccessResult(
        t(
          "changePassword.success",
          "Senha alterada com sucesso! Redirecionando para o login..."
        )
      );
      setTimeout(() => {
        navigate(`/${i18n.language}/login`);
      }, 2000);
    },
    onError: (error) => {
      console.error(
        "Change password failed:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message ||
        t(
          "changePassword.error",
          "Falha ao alterar senha. Por favor, tente novamente ou solicite um novo link."
        );
      setErrorResult(errorMessage);
    },
  });
};
