import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./page.css";
import { Input, PasswordInput } from "../../../components/input";
import Button from "../../../components/button/index.js";
import { useLogin } from "./useLogin.js";

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier) {
      newErrors.identifier = t(
        "login.usernameRequired",
        "Usuário é obrigatório"
      );
    }
    if (!formData.password) {
      newErrors.password = t("login.passwordRequired", "Senha é obrigatória");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await loginMutation.mutateAsync(formData);

      setTimeout(() => {
        navigate(`/${i18n.language}`);
      }, 1500);
    } catch (error) {}
  };

  const isLoading = loginMutation.isPending;
  const successResult = loginMutation.isSuccess
    ? t("login.success", "Login realizado com sucesso!")
    : "";
  const errorResult = loginMutation.isError
    ? loginMutation.error?.response?.data?.message ||
      t("login.error", "Falha no login. Verifique suas credenciais.")
    : "";

  return (
    <div className="divulgaif-login-container">
      <div className="login-content">
        <div className="login-header-with-favicon">
          <div className="login-header">
            <h1 className="main-title">DivulgaIF</h1>
          </div>
        </div>

        <div className="login-form-container">
          <h2 id="login-heading" className="login-heading">
            {t("login.title")}
          </h2>
          <p className="login-subheading">
            {t("login.access", "Acesse o DivulgaIF:")}
          </p>
          <form
            onSubmit={handleSubmit}
            className="login-form"
            aria-labelledby="login-heading"
          >
            <div className="form-group">
              <label htmlFor="identifier">{t("common.identifier")}:</label>
              <Input
                name="identifier"
                id="identifier"
                value={formData.identifier}
                onChange={handleChange}
                className={errors.identifier ? "input-error" : ""}
                placeholder={t(
                  "login.usernamePlaceholder",
                  "Email ou Matrícula"
                )}
                aria-invalid={!!errors.identifier}
                aria-describedby={
                  errors.identifier ? "identifier-error" : undefined
                }
              />
              {errors.identifier && (
                <span
                  id="identifier-error"
                  className="error-message"
                  role="alert"
                >
                  {errors.identifier}
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">{t("common.password")}:</label>
              <PasswordInput
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder={t("common.password")}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              {errors.password && (
                <span
                  id="password-error"
                  className="error-message"
                  role="alert"
                >
                  {errors.password}
                </span>
              )}
            </div>
            <Button
              type="submit"
              className="login-button"
              variant="secondary"
              disabled={isLoading}
              aria-busy={isLoading}
              ariaLabel={t("login.access", "Login")}
            >
              {isLoading
                ? t("login.loading", "Carregando...")
                : t("login.submit", "Acessar")}
            </Button>
            {successResult && (
              <div className="success-message" role="status" aria-live="polite">
                {successResult}
              </div>
            )}
            {errorResult && (
              <div className="success-message" role="status" aria-live="polite">
                {errorResult}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
