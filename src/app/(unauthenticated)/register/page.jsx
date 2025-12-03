import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./page.css";
import { Input, PasswordInput } from "../../../components/input";
import Button from "../../../components/button/index.js";
import { useRegister } from "./useRegister.js";
import { validateRegistrationForm } from "./useRegister.js";

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successResult, setSuccessResult] = useState("");
  const [errorResult, setErrorResult] = useState("");

  const registerMutation = useRegister(setSuccessResult, setErrorResult);

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
    const newErrors = validateRegistrationForm(formData, t);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrorResult("");
    setSuccessResult("");

    registerMutation.mutate(formData);
  };

  return (
    <div className="divulgaif-register-container">
      <div className="register-content">
        <div className="register-header-with-favicon">
          <div className="register-header">
            <h1 className="main-title">DivulgaIF</h1>
          </div>
        </div>

        <div className="register-form-container">
          <h2 id="register-heading" className="register-heading">
            {t("register.title", "Cadastro")}
          </h2>
          <p className="register-subheading">
            {t("register.subtitle", "Crie sua conta no DivulgaIF:")}
          </p>
          <form
            onSubmit={handleSubmit}
            className="register-form"
            aria-labelledby="register-heading"
          >
            <div className="form-group">
              <label htmlFor="name">
                {t("register.name", "Nome")} <span className="required">*</span>
              </label>
              <Input
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
                placeholder={t(
                  "register.namePlaceholder",
                  "Digite seu nome completo"
                )}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p className="error-text" id="name-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                {t("common.email")} <span className="required">*</span>
              </label>
              <Input
                name="email"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                placeholder={t("register.emailPlaceholder", "Digite seu email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p className="error-text" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t("common.password")}</label>
              <PasswordInput
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder={t(
                  "register.passwordPlaceholder",
                  "Digite sua senha"
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
                {t("register.confirmPassword", "Confirmar Senha")}
              </label>
              <PasswordInput
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
                placeholder={t(
                  "register.confirmPasswordPlaceholder",
                  "Confirme sua senha"
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
                className="register-button-small"
                variant="secondary"
                disabled={registerMutation.isPending}
                aria-busy={registerMutation.isPending}
                ariaLabel={t("register.submit", "Cadastrar")}
              >
                {registerMutation.isPending
                  ? t("common.loading", "Carregando...")
                  : t("register.submit", "Cadastrar")}
              </Button>
            </div>

            {successResult && (
              <div className="message" role="status" aria-live="polite">
                {successResult}
              </div>
            )}
            {errorResult && (
              <div className="message" role="alert">
                {errorResult}
              </div>
            )}

            <div className="register-options">
              <p className="options-text">
                {t("register.alreadyHaveAccount", "Já tem uma conta?")}{" "}
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

export default RegisterPage;
