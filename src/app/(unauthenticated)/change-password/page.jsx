import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./page.css";
import { PasswordInput } from "../../../components/input";
import Button from "../../../components/button/index.js";
import { useChangePassword } from "./useChangePassword.js";

const ChangePasswordPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successResult, setSuccessResult] = useState("");
  const [errorResult, setErrorResult] = useState("");

  const changePasswordMutation = useChangePassword(
    setSuccessResult,
    setErrorResult
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = t(
        "changePassword.passwordRequired",
        "Senha é obrigatória"
      );
    } else if (formData.password.length < 6) {
      newErrors.password = t(
        "changePassword.passwordTooShort",
        "Senha deve ter no mínimo 6 caracteres"
      );
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t(
        "changePassword.confirmPasswordRequired",
        "Confirmação de senha é obrigatória"
      );
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t(
        "changePassword.passwordMismatch",
        "As senhas não coincidem"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrorResult(t("changePassword.noToken", "Token inválido ou ausente"));
      return;
    }

    if (!validateForm()) return;

    setErrorResult("");
    setSuccessResult("");

    changePasswordMutation.mutate({
      token,
      password: formData.password,
    });
  };

  // If no token, show error message
  if (!token) {
    return (
      <div className="divulgaif-change-password-container">
        <div className="change-password-content">
          <div className="change-password-header-with-favicon">
            <div className="change-password-header">
              <h1 className="main-title">DivulgaIF</h1>
            </div>
          </div>
          <div className="change-password-form-container">
            <h2 className="change-password-heading">
              {t("changePassword.title", "Alterar Senha")}
            </h2>
            <div className="message error-message">
              {t(
                "changePassword.invalidToken",
                "Token inválido ou ausente. Por favor, solicite um novo link de recuperação."
              )}
            </div>
            <div className="back-to-login-container">
              <a href={`/${i18n.language}/login`} className="login-link">
                {t("common.login", "Voltar ao Login")}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="divulgaif-change-password-container">
      <div className="change-password-content">
        <div className="change-password-header-with-favicon">
          <div className="change-password-header">
            <h1 className="main-title">DivulgaIF</h1>
          </div>
        </div>

        <div className="change-password-form-container">
          <h2 id="change-password-heading" className="change-password-heading">
            {t("changePassword.title", "Alterar Senha")}
          </h2>
          <p className="change-password-subheading">
            {t("changePassword.subtitle", "Digite sua nova senha:")}
          </p>
          <form
            onSubmit={handleSubmit}
            className="change-password-form"
            aria-labelledby="change-password-heading"
          >
            <div className="form-group">
              <label htmlFor="password">
                {t("changePassword.newPassword", "Nova Senha")}:
              </label>
              <PasswordInput
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder={t(
                  "changePassword.passwordPlaceholder",
                  "Digite sua nova senha"
                )}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              {errors.password && (
                <p className="error-text" id="password-error">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                {t("changePassword.confirmPassword", "Confirmar Senha")}:
              </label>
              <PasswordInput
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
                placeholder={t(
                  "changePassword.confirmPasswordPlaceholder",
                  "Confirme sua nova senha"
                )}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
              />
              {errors.confirmPassword && (
                <p className="error-text" id="confirmPassword-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="form-group-button">
              <Button
                type="submit"
                className="change-password-button-small"
                variant="secondary"
                disabled={changePasswordMutation.isPending}
                aria-busy={changePasswordMutation.isPending}
                ariaLabel={t("changePassword.submit", "Alterar Senha")}
              >
                {changePasswordMutation.isPending
                  ? t("common.loading", "Carregando...")
                  : t("changePassword.submit", "Alterar Senha")}
              </Button>
            </div>

            {successResult && (
              <div
                className="message success-message"
                role="status"
                aria-live="polite"
              >
                {successResult}
              </div>
            )}
            {errorResult && (
              <div className="message error-message" role="alert">
                {errorResult}
              </div>
            )}

            <div className="back-to-login-container">
              <p className="back-to-login-text">
                <a href={`/${i18n.language}/login`} className="login-link">
                  {t("common.login", "Voltar ao Login")}
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
