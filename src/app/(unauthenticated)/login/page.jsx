import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./page.css";
import { Input, PasswordInput } from "../../../components/input";
import Button from "../../../components/button/index.js";
import useSuap from "./useSuap.js";
import { useLogin } from "./useLogin.js";

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [successResult, setSuccessResult] = useState("");
  const [errorResult, setErrorResult] = useState("");
  const { loginWithSuap, error: suapError, clearError } = useSuap();

  // Properly use the useLogin hook
  const loginMutation = useLogin();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = t("login.usernameRequired", "Usuário é obrigatório");
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

    setErrorResult("");
    setSuccessResult("");

    loginMutation.mutate(
      {
        identifier: formData.username,
        password: formData.password,
      },
      {
        onSuccess: (data) => {
          setSuccessResult(t("login.success", "Login realizado com sucesso!"));
          setTimeout(() => {
            navigate(`/${i18n.language}`);
          }, 1000);
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message ||
            t("login.error", "Falha no login. Verifique suas credenciais.");
          setErrorResult(errorMessage);
        },
      }
    );
  };

  const handleSuapLogin = () => {
    clearError();
    loginWithSuap();
  };

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
            {t("login.access", "Acesse ao DivulgaIF:")}
          </p>
          <form
            onSubmit={handleSubmit}
            className="login-form"
            aria-labelledby="login-heading"
          >
            <div className="form-group">
              <label htmlFor="username">{t("common.email")}:</label>
              <Input
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "input-error" : ""}
                placeholder={t("login.usernamePlaceholder", "Digite seu email")}
                aria-invalid={!!errors.username}
                aria-describedby={
                  errors.username ? "username-error" : undefined
                }
              />
              {errors.username && (
                <span
                  id="username-error"
                  className="error-message"
                  role="alert"
                >
                  {errors.username}
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
              className="secondary"
              variant="secondary"
              disabled={loginMutation.isPending}
              aria-busy={loginMutation.isPending}
              ariaLabel={t("login.access", "Acessar o sistema")}
            >
              {loginMutation.isPending
                ? t("login.loading", "Carregando...")
                : t("login.submit", "Acessar")}
            </Button>
            {successResult && (
              <div className="success-message" role="status" aria-live="polite">
                {successResult}
              </div>
            )}
            {errorResult && (
              <div className="success-message" role="alert">
                {errorResult}
              </div>
            )}
            <div
              className="login-options"
              aria-labelledby="login-options-heading"
            >
              <p id="login-options-heading" className="options-divider">
                {t("login.loginWith", "Entrar com:")}
              </p>
              <Button
                type="button"
                variant="secondary"
                ariaLabel={t("login.loginWithSUAP", "Entrar com SUAP")}
                onClick={handleSuapLogin}
              >
                SUAP
              </Button>
              {suapError && (
                <div className="error-message" role="alert">
                  {suapError}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
