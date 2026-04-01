import { renderHook, act } from '@testing-library/react';
import useSuap from '../useSuap';
import api from '../../../../services/utils/api';
import { createSuap } from '../../../../services/users/createSuap';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

jest.mock('../../../../services/utils/api');
jest.mock('../../../../services/users/createSuap');

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'pt' } }),
}));

describe('useSuap Security - Advanced Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // --- OWASP A03:2021 - Injection & Data Integrity ---

  it('deve neutralizar dados com scripts maliciosos vindos da API (Preventing XSS via Storage)', async () => {
    localStorage.setItem('oauth_hash', '#access_token=valid');
    const maliciousData = {
      identificacao: '123',
      nome_registro: '<img src=x onerror=alert(1)> Hacker',
      email: 'attacker@evil.com',
      tipo_usuario: 'ALUNO'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => maliciousData,
    });

    api.post.mockResolvedValueOnce({
      data: { accessToken: 'at', user: maliciousData }
    });

    const { result } = renderHook(() => useSuap());
    await act(async () => {
      await result.current.handleOAuthCallback();
    });

    // Verifica se os dados foram sanitizados (XSS removido)
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    expect(storedUser.nome_registro).not.toContain('<img');
    expect(storedUser.nome_registro).toContain('Hacker'); // Parte segura permanece
    expect(mockNavigate).toHaveBeenCalled();
  });

  // --- OWASP A04:2021 - Insecure Design (Concurrency) ---

  it('deve impedir execuções duplicadas simultâneas (Race Condition Protection)', async () => {
    localStorage.setItem('oauth_hash', '#access_token=token');
    global.fetch.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ ok: true, json: async () => ({ id: 1 }) }), 50)
    ));

    const { result } = renderHook(() => useSuap());
    
    // Dispara múltiplas chamadas ao mesmo tempo
    let promise1, promise2;
    await act(async () => {
      promise1 = result.current.handleOAuthCallback();
      promise2 = result.current.handleOAuthCallback();
    });

    await Promise.all([promise1, promise2]);

    // O fetch deve ter sido chamado apenas uma vez se houver controle de estado isProcessing
    // Se o seu código original não previne isso, este teste falhará, indicando uma vulnerabilidade.
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // --- Persistence & Storage Edge Cases ---

  it('deve lidar com falha de cota excedida no LocalStorage (QUOTA_EXCEEDED_ERR)', async () => {
    localStorage.setItem('oauth_hash', '#access_token=valid');
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
    api.post.mockResolvedValueOnce({ data: { accessToken: 'at' } });

    // Mock do setItem para lançar erro de disco cheio/privacidade
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useSuap());
    const success = await act(async () => {
      return await result.current.handleOAuthCallback();
    });

    // O hook deve retornar false e não travar a aplicação
    expect(success).toBe(false);
    expect(result.current.error).toBeDefined();
    spy.mockRestore();
  });

  // --- A07:2021 - Broken Authentication (Token Spoofing) ---

  it('deve rejeitar se o servidor retornar um accessToken nulo ou vazio', async () => {
    localStorage.setItem('oauth_hash', '#access_token=valid');
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
    
    // API retorna sucesso mas sem o token (vulnerabilidade de bypass)
    api.post.mockResolvedValueOnce({ data: { accessToken: null } });

    const { result } = renderHook(() => useSuap());
    await act(async () => {
      await result.current.handleOAuthCallback();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve validar o formato do hash antes do processamento (Malformed Fragment)', async () => {
    // Hash que não segue o padrão key=value
    localStorage.setItem('oauth_hash', '#access_token_without_equal_sign');
    
    const { result } = renderHook(() => useSuap());
    const success = await act(async () => {
      return await result.current.handleOAuthCallback();
    });

    expect(success).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // --- Resilience ---

  it('deve parar a execução se a criação do usuário falhar criticamente (Chain Failure)', async () => {
    localStorage.setItem('oauth_hash', '#access_token=token');
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
    
    api.post.mockRejectedValueOnce(new Error('User Not Found')); // Primeira tentativa falha
    createSuap.mockRejectedValueOnce(new Error('Database Down')); // Criação falha

    const { result } = renderHook(() => useSuap());
    
    await act(async () => {
      await result.current.handleOAuthCallback();
    });

    // Não deve tentar o segundo login se a criação falhou
    expect(api.post).toHaveBeenCalledTimes(1); 
    expect(result.current.error).toContain('Falha na autenticação');
  });
});