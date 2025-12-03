import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./page.css";
import { Input } from "../../../components/input";
import Button from "../../../components/button/index.js";
import { useForgotPassword } from "./useForgotPassword.js";

const ForgotPasswordPage = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [successResult, setSuccessResult] = useState("");
  const [errorResult, setErrorResult] = useState("");

  const forgotPasswordMutation = useForgotPassword(
    setSuccessResult,
    setErrorResult
  );

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = t(
        "forgotPassword.emailRequired",
        "Email é obrigatório"
      );
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("forgotPassword.emailInvalid", "Email inválido");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrorResult("");
    setSuccessResult("");

    forgotPasswordMutation.mutate({ email });
  };

  return (
    <div className="divulgaif-forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-header-with-favicon">
          <div className="forgot-password-header">
            <h1 className="main-title">DivulgaIF</h1>
          </div>
        </div>

        <div className="forgot-password-form-container">
          <h2 id="forgot-password-heading" className="forgot-password-heading">
            {t("forgotPassword.title", "Recuperar Senha")}
          </h2>
          <p className="forgot-password-subheading">
            {t(
              "forgotPassword.subtitle",
              "Digite seu email para receber o link de recuperação:"
            )}
          </p>
          <form
            onSubmit={handleSubmit}
            className="forgot-password-form"
            aria-labelledby="forgot-password-heading"
          >
            <div className="form-group">
              <label htmlFor="email">{t("common.email")}:</label>
              <Input
                name="email"
                id="email"
                type="email"
                value={email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                placeholder={t(
                  "forgotPassword.emailPlaceholder",
                  "Digite seu email"
                )}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p className="error-text" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-group-button">
              <Button
                type="submit"
                className="forgot-password-button-small"
                variant="secondary"
                disabled={forgotPasswordMutation.isPending}
                aria-busy={forgotPasswordMutation.isPending}
                ariaLabel={t("forgotPassword.submit", "Enviar")}
              >
                {forgotPasswordMutation.isPending
                  ? t("common.loading", "Carregando...")
                  : t("forgotPassword.submit", "Enviar")}
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
                {t("forgotPassword.rememberPassword", "Lembrou sua senha?")}{" "}
                <a href={`/${i18n.language}/login`} className="login-link">
                  {t("common.login", "Entrar")}
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
