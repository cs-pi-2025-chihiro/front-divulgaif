import React, { useState, useEffect } from 'react';
import './page.css';
import { Input, PasswordInput } from '../../../components/input';
import Button from '../../../components/button/index.js';
import Image from '../../../components/image/image';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successResult, setSuccessResult] = useState('');
  const [errorResult, setErrorResult] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Usuário é obrigatório';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrorResult('');
    setSuccessResult('');
    
    try {
      // só pra fingir de conta q ta funfando
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessResult('Login realizado com sucesso!');
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
      }, 1000);
    } catch (error) {
      setErrorResult('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="divulgaif-login-container">
      <div className="login-content">
        <div className="login-header">
          <h1 className="main-title">DivulgaIF</h1>
        </div>
        
        <div className="login-form-container">
          <h2 className="login-heading">Login</h2>
          <p className="login-subheading">Acesse ao DivulgaIF:</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuário:</label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'input-error' : ''}
                placeholder="Digite seu usuário"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Senha:</label>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                placeholder="Senha"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <Button 
              type="submit" 
              className="secondary"
              variant="secondary" 
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Acessar'}
            </Button>
            
            <div className="login-options">
              <p className="options-divider">Entrar com:</p>
              <Button 
                type="button" 
                variant="secondary"
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