import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mocking components and hooks to isolate LoginPage
jest.mock('../../../../components/input', () => ({
  Input: (props) => <input data-testid="mock-input" {...props} />,
  PasswordInput: (props) => <input data-testid="mock-password-input" type="password" {...props} />,
}));
jest.mock('../../../../components/button/index.js', () => ({
  __esModule: true,
  default: ({ children, onClick, type, disabled, ariaLabel }) => (
    <button onClick={onClick} type={type} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
    i18n: { language: 'pt' },
  }),
}));
jest.mock('../useSuap.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../useLogin.js', () => ({
  useLogin: jest.fn(),
}));

// Import LoginPage after mocks
import LoginPage from '../page';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../useLogin';
import useSuap from '../useSuap';

describe('LoginPage', () => {
  const mockNavigate = jest.fn();
  const mockLoginMutation = {
    mutate: jest.fn(),
    isPending: false,
  };
  const mockLoginWithSuap = jest.fn();
  const mockClearSuapError = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    useLogin.mockReturnValue(mockLoginMutation);
    useSuap.mockReturnValue({
      loginWithSuap: mockLoginWithSuap,
      error: null,
      clearError: mockClearSuapError,
    });
    jest.clearAllMocks();
  });

  // Cenário 1: Renderização inicial
  test('deve renderizar o formulário de login corretamente com todos os elementos', () => {
    render(<LoginPage />);

    expect(screen.getByText('DivulgaIF')).toBeInTheDocument();
    expect(screen.getByText('Acesse ao DivulgaIF:')).toBeInTheDocument();
    expect(screen.getByLabelText('common.email:')).toBeInTheDocument();
    expect(screen.getByLabelText('common.password:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acessar o sistema' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar com SUAP' })).toBeInTheDocument();
    expect(screen.getByText('Esqueceu sua senha?')).toBeInTheDocument();
    expect(screen.getByText('Cadastrar')).toBeInTheDocument();
  });

  // Cenário 2: Interação do usuário - atualização dos inputs
  test('deve atualizar os valores dos campos de input ao digitar', () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText('common.email:');
    const passwordInput = screen.getByLabelText('common.password:');

    fireEvent.change(usernameInput, { target: { name: 'username', value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  // Cenário 3: Validação de formulário - campos vazios
  test('deve exibir mensagens de erro para campos vazios ao tentar submeter', async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Acessar o sistema' }));

    await waitFor(() => {
      expect(screen.getByText('Usuário é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });
    expect(mockLoginMutation.mutate).not.toHaveBeenCalled();
  });

  // Cenário 4.1: Mock de API/Autenticação - requisição falha
  test('deve exibir mensagem de erro ao falhar o login com credenciais inválidas', async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText('common.email:');
    const passwordInput = screen.getByLabelText('common.password:');
    const submitButton = screen.getByRole('button', { name: 'Acessar o sistema' });

    fireEvent.change(usernameInput, { target: { name: 'username', value: 'invaliduser' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'wrongpass' } });

    mockLoginMutation.mutate.mockImplementationOnce((_credentials, { onError }) => {
      onError({ response: { data: { message: 'Credenciais inválidas' } } });
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLoginMutation.mutate).toHaveBeenCalledWith(
        { identifier: 'invaliduser', password: 'wrongpass' },
        expect.any(Object)
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciais inválidas');
    });
  });

  // Cenário 4.2: Mock de API/Autenticação - requisição de sucesso
  test('deve redirecionar para a página inicial após login bem-sucedido', async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText('common.email:');
    const passwordInput = screen.getByLabelText('common.password:');
    const submitButton = screen.getByRole('button', { name: 'Acessar o sistema' });

    fireEvent.change(usernameInput, { target: { name: 'username', value: 'validuser' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'correctpass' } });

    mockLoginMutation.mutate.mockImplementationOnce((_credentials, { onSuccess }) => {
      onSuccess({ accessToken: 'fake_token', refreshToken: 'fake_refresh_token', user: { roles: [{ name: 'user' }] } });
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLoginMutation.mutate).toHaveBeenCalledWith(
        { identifier: 'validuser', password: 'correctpass' },
        expect.any(Object)
      );
      expect(screen.getByRole('status')).toHaveTextContent('Login realizado com sucesso!');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/pt');
    }, { timeout: 1500 });
  });

  // Cenário adicional: Interação com o botão SUAP
  test('deve chamar loginWithSuap ao clicar no botão SUAP', () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Entrar com SUAP' }));

    expect(mockLoginWithSuap).toHaveBeenCalledTimes(1);
  });

  // Cenário adicional: Exibição de erro SUAP
  test('deve exibir erro do SUAP se presente', () => {
    useSuap.mockReturnValue({
      loginWithSuap: mockLoginWithSuap,
      error: 'Erro ao conectar com SUAP',
      clearError: mockClearSuapError,
    });
    render(<LoginPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Erro ao conectar com SUAP');
  });
});
