import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { create } from "../../../services/users/create";
import { validateEmail } from "../../../services/utils/validation";

export const validateRegistrationForm = (formData, t) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = t("register.nameRequired", "Nome é obrigatório");
  }

  if (!formData.email.trim()) {
    errors.email = t("register.emailRequired", "Email é obrigatório");
  } else if (!validateEmail(formData.email)) {
    errors.email = t("register.emailInvalid", "Email inválido");
  }

  if (formData.password && formData.password.length < 6) {
    errors.password = t(
      "register.passwordTooShort",
      "Senha deve ter no mínimo 6 caracteres"
    );
  }

  if (formData.password && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = t(
      "register.passwordMismatch",
      "As senhas não coincidem"
    );
  }

  return errors;
};

export const prepareRegistrationData = (formData) => {
  const submitData = {
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password || undefined,
    userType: "STUDENT",
  };

  Object.keys(submitData).forEach(
    (key) => submitData[key] === undefined && delete submitData[key]
  );

  return submitData;
};

export const useRegister = (setSuccessResult, setErrorResult) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return useMutation({
    mutationFn: async (formData) => {
      const userData = prepareRegistrationData(formData);
      const response = await create(userData);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Registration successful:", data);
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

      setSuccessResult(
        t("register.success", "Cadastro realizado com sucesso!")
      );
      setTimeout(() => {
        navigate(`/${i18n.language}/`);
      }, 2000);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        t("register.error", "Falha no cadastro. Por favor, tente novamente.");
      if (errorMessage.includes("already exists")) {
        setErrorResult(
          t(
            "register.emailExists",
            "Email ou nome já utilizados, por favor, escolha outro."
          )
        );
        return;
      }
      setErrorResult(errorMessage);
    },
  });
};
