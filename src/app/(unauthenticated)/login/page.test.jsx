import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';

// 1. MOCK DE OBJETOS E DEPENDÊNCIAS (Diretriz de isolamento)
// Mock do react-i18next para evitar falhas de renderização por falta de contexto de tradução
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key, // Retorna o fallback (texto em português) ou a chave
    i18n: { language: 'pt' },
  }),
}));

// Mock do hook de navegação do React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock do hook customizado useLogin (React Query/API)
const mockMutate = jest.fn();
jest.mock('./useLogin.js', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

// Mock do hook customizado useSuap
jest.mock('./useSuap.js', () => ({
  __esModule: true,
  default: () => ({
    loginWithSuap: jest.fn(),
    error: null,
    clearError: jest.fn(),
  }),
}));

// Mock dos componentes de Input
jest.mock('../../../components/input', () => ({
  Input: (props) => <input data-testid="mock-input" {...props} />,
  PasswordInput: (props) => <input type="password" data-testid="mock-password-input" {...props} />,
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Cenário 1: Renderização inicial
  it('deve renderizar os campos de email, senha e o botão de login corretamente', () => {
    render(<LoginPage />);
    
    expect(screen.getByPlaceholderText('Digite seu email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('common.password')).toBeInTheDocument(); 
    expect(screen.getByRole('button', { name: 'Acessar o sistema' })).toBeInTheDocument();
  });

  // Cenário 2: Interação do usuário
  it('deve atualizar os valores dos inputs quando o usuário digita', () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Digite seu email');
    const passwordInput = screen.getByPlaceholderText('common.password');

    fireEvent.change(emailInput, { target: { name: 'username', value: 'teste@email.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'senha123' } });

    expect(emailInput.value).toBe('teste@email.com');
    expect(passwordInput.value).toBe('senha123');
  });

  // Cenário 3: Validação de formulário
  it('deve exibir mensagens de erro ao tentar enviar o formulário com campos vazios', async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: 'Acessar o sistema' });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Usuário é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  // Cenário 4: Mock de API/Autenticação - Falha
  it('deve exibir mensagem de erro quando a requisição de login falhar', async () => {
    mockMutate.mockImplementation((variables, options) => {
      options.onError({
        response: { data: { message: 'Credenciais inválidas' } }
      });
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Digite seu email'), { target: { name: 'username', value: 'teste@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('common.password'), { target: { name: 'password', value: 'senhaerrada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acessar o sistema' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciais inválidas');
    });
  });

  // Cenário 5: Mock de API/Autenticação - Sucesso
  it('deve exibir mensagem de sucesso e redirecionar a rota quando o login for bem-sucedido', async () => {
    jest.useFakeTimers();

    mockMutate.mockImplementation((variables, options) => {
      options.onSuccess({ accessToken: 'fake-token' });
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Digite seu email'), { target: { name: 'username', value: 'teste@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('common.password'), { target: { name: 'password', value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acessar o sistema' }));

    await waitFor(() => {
      expect(screen.getByText('Login realizado com sucesso!')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1000);

    expect(mockNavigate).toHaveBeenCalledWith('/pt');

    jest.useRealTimers();
  });
});