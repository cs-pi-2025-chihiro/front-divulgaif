import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../../../services/utils/api";
import { ENDPOINTS } from "../../../enums/endpoints";

const forgotPassword = async (email) => {
  const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, email);
  return response.data;
};

export const useForgotPassword = (setSuccessResult, setErrorResult) => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      console.log("Forgot password successful:", data);
      setSuccessResult(
        t(
          "forgotPassword.success",
          "Email de recuperação enviado com sucesso! Verifique sua caixa de entrada."
        )
      );
    },
    onError: (error) => {
      console.error(
        "Forgot password failed:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message ||
        t(
          "forgotPassword.error",
          "Falha ao enviar email de recuperação. Por favor, tente novamente."
        );
      setErrorResult(errorMessage);
    },
  });
};
