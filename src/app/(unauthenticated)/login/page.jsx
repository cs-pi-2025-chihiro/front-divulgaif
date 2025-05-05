import React, { useState, useEffect } from "react";
import "./page.css";
import { Input, PasswordInput } from "../../../components/input";
import Button from "../../../components/button/index.js";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successResult, setSuccessResult] = useState("");
  const [errorResult, setErrorResult] = useState("");

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
      newErrors.username = "Usuário é obrigatório";
    }
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrorResult("");
    setSuccessResult("");
    try {
      // só pra fingir de conta q ta funfando
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessResult("Login realizado com sucesso!");
      setTimeout(() => {
        console.log("Redirecting to dashboard...");
      }, 1000);
    } catch (error) {
      setErrorResult("Falha no login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="divulgaif-login-container">
      <div className="login-content">
        <div className="login-header-with-favicon">
          <div className="login-header">
            <a href="/" tabIndex="0" aria-label="DivulgaIF página inicial">
              <h1 className="main-title">DivulgaIF</h1>
            </a>
          </div>
        </div>

        <div className="login-form-container">
          <h2 id="login-heading" className="login-heading">Login</h2>
          <p className="login-subheading">Acesse ao DivulgaIF:</p>
          <form onSubmit={handleSubmit} className="login-form" aria-labelledby="login-heading">
            <div className="form-group">
              <label htmlFor="username">Usuário:</label>
              <Input
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "input-error" : ""}
                placeholder="Digite seu usuário"
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
              {errors.username && (
                <span id="username-error" className="error-message" role="alert">{errors.username}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha:</label>
              <PasswordInput
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder="Senha"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <span id="password-error" className="error-message" role="alert">{errors.password}</span>
              )}
            </div>
            <Button
              type="submit"
              className="secondary"
              variant="secondary"
              disabled={isLoading}
              aria-busy={isLoading}
              ariaLabel="Acessar o sistema"
            >
              {isLoading ? "Carregando..." : "Acessar"}
            </Button>
            {successResult && (
              <div className="success-message" role="status" aria-live="polite">{successResult}</div>
            )}
            {errorResult && (
              <div className="error-message" role="alert">{errorResult}</div>
            )}
            <div className="login-options" aria-labelledby="login-options-heading">
              <p id="login-options-heading" className="options-divider">Entrar com:</p>
              <Button 
                type="button" 
                variant="secondary"
                ariaLabel="Entrar com SUAP"
                onClick={() => window.location.href="https://suap.ifpr.edu.br"}
              >
                SUAP
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
