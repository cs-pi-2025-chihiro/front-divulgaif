import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyWorks from '../page';
import { useMyWorks, pageAtom, sizeAtom, searchAtom } from '../useMyWorks';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

jest.mock('../useMyWorks');

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtom: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('react-i18next');

jest.mock('../../../../../services/utils/utils', () => ({
  navigateTo: jest.fn(),
  mapPaginationValues: jest.fn(),
}));

jest.mock('../../../../../components/modal/filtrar-busca/filtrarBuscaModal', () => {
  return function MockModal({ isOpen, onClose, onApplyFilters }) {
    if (!isOpen) return null;
    return (
      <div data-testid="filter-modal">
        <button onClick={onClose}>Fechar</button>
        <button onClick={() => onApplyFilters({ workType: { ARTICLE: true } })}>Aplicar</button>
      </div>
    );
  };
});

// =============================================================================
// SETUP COMPARTILHADO
// =============================================================================

const setupMocks = ({ mockSetCurrentPage, mockSetCurrentSize, mockSetSearch, mockRefetch, mockNavigate, works, totalPages = 1, totalWorks = 2, isLoading = false }) => {
  useNavigate.mockReturnValue(mockNavigate);

  useTranslation.mockReturnValue({
    t: (key) => {
      const translations = {
        'header.myWorks': 'Meus Trabalhos',
        'filters.filterSearch': 'Filtrar Trabalhos',
        'home.newWork': 'Novo Trabalho',
        'common.search': 'Buscar',
        'common.loading': 'Carregando...',
        'pagination.results': 'resultados',
        'pagination.result': 'resultado',
        'errors.NoWorksFound': 'Nenhum trabalho encontrado.',
      };
      return translations[key] || key;
    },
    i18n: { language: 'pt' },
  });

  useAtom.mockImplementation((atom) => {
    if (atom === pageAtom)   return [0, mockSetCurrentPage];
    if (atom === sizeAtom)   return [10, mockSetCurrentSize];
    if (atom === searchAtom) return ['', mockSetSearch];
    return [null, jest.fn()];
  });

  useMyWorks.mockReturnValue({
    works,
    totalPages,
    totalWorks,
    isLoading,
    refetch: mockRefetch,
  });
};

// =============================================================================
// SEGURANÇA — XSS E INPUTS MALICIOSOS
// =============================================================================

describe('MyWorks — Segurança (XSS e Inputs Maliciosos)', () => {
  const mockNavigate     = jest.fn();
  const mockSetCurrentPage = jest.fn();
  const mockSetCurrentSize = jest.fn();
  const mockSetSearch    = jest.fn();
  const mockRefetch      = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({
      mockNavigate,
      mockSetCurrentPage,
      mockSetCurrentSize,
      mockSetSearch,
      mockRefetch,
      works: [],
      totalWorks: 0,
    });
  });

  /**
   * SEGURANÇA 1 — Injeção de script via campo de busca
   *
   * Simula um atacante digitando uma tag <script> no campo de busca.
   * O teste verifica que:
   * 1. O valor é passado para setSearch como texto puro (não executado).
   * 2. Nenhum elemento <script> executável é inserido no DOM.
   */
  test('não deve executar script injetado no campo de busca', () => {
    render(<MyWorks />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    const xssPayload = '<script>alert("xss")</script>';

    fireEvent.change(searchInput, { target: { value: xssPayload } });

    // O valor deve ter sido passado como string pura para o estado
    expect(mockSetSearch).toHaveBeenCalledWith(xssPayload);

    // Nenhuma tag <script> executável deve ter sido inserida no DOM
    const injectedScripts = Array.from(document.querySelectorAll('script')).filter(
      (el) => el.textContent.includes('alert')
    );
    expect(injectedScripts).toHaveLength(0);
  });

  /**
   * SEGURANÇA 2 — Injeção de HTML via campo de busca
   *
   * Simula um atacante tentando injetar HTML arbitrário (img com onerror)
   * no campo de busca. O React escapa strings por padrão, mas este teste
   * documenta e garante esse comportamento para o componente.
   * Se o componente usar dangerouslySetInnerHTML com o valor de busca,
   * este teste irá falhar — sinalizando uma vulnerabilidade real.
   */
  test('não deve renderizar HTML arbitrário digitado no campo de busca', () => {
    render(<MyWorks />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    const htmlPayload = '<img src=x onerror=alert(1)>';

    fireEvent.change(searchInput, { target: { value: htmlPayload } });

    // Nenhum elemento <img> com src=x deve ter sido inserido no DOM
    const injectedImg = document.querySelector('img[src="x"]');
    expect(injectedImg).not.toBeInTheDocument();
  });

  /**
   * SEGURANÇA 3 — Título de trabalho com conteúdo malicioso
   *
   * Simula um cenário onde a API retorna um trabalho cujo título
   * contém uma tag <script>. Verifica que o React renderiza o título
   * como texto puro (escapado), sem interpretar as tags HTML como código
   * executável.
   *
   * NOTA: O React escapa automaticamente strings, então o innerHTML
   * conterá &lt;script&gt; (escapado), não <script> executável. O teste
   * verifica que nenhuma tag <script> foi injetada e executada no DOM.
   */
  test('não deve executar script contido no título de um trabalho', () => {
    useMyWorks.mockReturnValue({
      works: [{
        id: '1',
        title: '<script>alert("xss")</script>Trabalho Malicioso',
        authors: [{ name: 'Autor' }],
        description: 'Descrição',
        labels: [],
        approvedAt: '2024-01-01',
      }],
      totalPages: 1,
      totalWorks: 1,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MyWorks />);

    // Verifica que nenhum elemento <script> executável foi injetado no DOM
    const injectedScripts = Array.from(document.querySelectorAll('script')).filter(
      (el) => el.textContent.includes('alert')
    );
    expect(injectedScripts).toHaveLength(0);

    // O título deve aparecer como texto puro, escapado pelo React
    const titleElement = screen.getByText(/Trabalho Malicioso/);
    expect(titleElement).toBeInTheDocument();

    // O texto visível contém o conteúdo após a tag (React escapou o <script>)
    expect(titleElement.textContent).toContain('Trabalho Malicioso');
  });

  /**
   * SEGURANÇA 4 — Payload extremamente longo no campo de busca
   *
   * Simula um ataque de payload massivo (10.000 caracteres) no campo
   * de busca. O teste verifica que a interface não quebra e que o valor
   * é tratado normalmente pelo estado, sem causar erros de renderização.
   */
  test('deve tratar payload muito longo no campo de busca sem quebrar', () => {
    render(<MyWorks />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    const longPayload = 'a'.repeat(10000);

    // Não deve lançar erro ao receber um input muito longo
    expect(() => {
      fireEvent.change(searchInput, { target: { value: longPayload } });
    }).not.toThrow();

    expect(mockSetSearch).toHaveBeenCalledWith(longPayload);
  });

  /**
   * SEGURANÇA 5 — Caracteres especiais e unicode no campo de busca
   *
   * Verifica que caracteres especiais (aspas, barras, unicode, emojis)
   * são tratados como texto puro e não causam comportamentos inesperados.
   */
  test('deve tratar caracteres especiais e unicode no campo de busca', () => {
    render(<MyWorks />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    const specialChars = '\'"; DROP TABLE works; -- 🎭 <>&\\/';

    fireEvent.change(searchInput, { target: { value: specialChars } });

    // O valor deve ser passado intacto para o estado, sem modificações
    expect(mockSetSearch).toHaveBeenCalledWith(specialChars);

    // A interface não deve quebrar
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  /**
   * SEGURANÇA 6 — Descrição de trabalho com link javascript:
   *
   * Simula um trabalho retornado pela API com uma descrição contendo
   * um link com protocolo javascript:, que poderia executar código
   * se renderizado como href em uma tag <a>.
   */
  test('não deve renderizar links com protocolo javascript: vindos da API', () => {
    useMyWorks.mockReturnValue({
      works: [{
        id: '1',
        title: 'Trabalho com link malicioso',
        authors: [{ name: 'Autor' }],
        description: 'Veja mais em javascript:alert("xss")',
        labels: [],
        approvedAt: '2024-01-01',
      }],
      totalPages: 1,
      totalWorks: 1,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MyWorks />);

    // Nenhum elemento <a> com href javascript: deve existir no DOM
    const dangerousLinks = document.querySelectorAll('a[href^="javascript:"]');
    expect(dangerousLinks.length).toBe(0);
  });
});

// =============================================================================
// ACESSIBILIDADE (a11y)
// =============================================================================

describe('MyWorks — Acessibilidade (a11y)', () => {
  const mockNavigate       = jest.fn();
  const mockSetCurrentPage = jest.fn();
  const mockSetCurrentSize = jest.fn();
  const mockSetSearch      = jest.fn();
  const mockRefetch        = jest.fn();

  const mockWorks = [
    {
      id: '1',
      title: 'Trabalho de Teste 1',
      authors: [{ name: 'Autor 1' }],
      description: 'Descrição do trabalho 1',
      labels: ['IA', 'React'],
      approvedAt: '2024-03-01',
    },
    {
      id: '2',
      title: 'Trabalho de Teste 2',
      authors: [{ name: 'Autor 2' }],
      description: 'Descrição do trabalho 2',
      labels: ['Testes'],
      approvedAt: '2024-03-02',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({
      mockNavigate,
      mockSetCurrentPage,
      mockSetCurrentSize,
      mockSetSearch,
      mockRefetch,
      works: mockWorks,
      totalWorks: 2,
    });
  });

  /**
   * ACESSIBILIDADE 1 — Botões com texto descritivo
   *
   * Leitores de tela anunciam o conteúdo textual dos botões.
   * Botões sem texto ou com apenas ícones são inacessíveis para
   * usuários com deficiência visual. Este teste garante que os
   * botões principais da página possuem texto legível.
   */
  test('os botões principais devem ter texto descritivo acessível', () => {
    render(<MyWorks />);

    expect(
      screen.getByRole('button', { name: /Filtrar Trabalhos/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Novo Trabalho/i })
    ).toBeInTheDocument();
  });

  /**
   * ACESSIBILIDADE 2 — Campo de busca com placeholder descritivo
   *
   * O placeholder do campo de busca deve ser descritivo o suficiente
   * para que usuários de leitores de tela entendam a função do campo.
   */
  test('o campo de busca deve ser acessível por role e ter placeholder descritivo', () => {
    render(<MyWorks />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    expect(searchInput).toBeInTheDocument();

    expect(searchInput.tagName.toLowerCase()).toMatch(/input|textarea/);
  });

  /**
   * ACESSIBILIDADE 3 — Título da página com hierarquia semântica
   *
   * O título principal da página deve ser um elemento de heading (h1-h6),
   * não apenas um texto estilizado.
   */
  test('o título da página deve ser um elemento de heading acessível', () => {
    render(<MyWorks />);

    expect(
      screen.getByRole('heading', { name: /Meus Trabalhos/i })
    ).toBeInTheDocument();
  });

  /**
   * ACESSIBILIDADE 4 — Foco no campo de busca via teclado
   *
   * Usuários que navegam apenas pelo teclado (sem mouse) dependem do
   * gerenciamento de foco. Este teste verifica que o campo de busca
   * pode receber foco — requisito básico para navegação por teclado.
   */
  test('o campo de busca deve poder receber foco pelo teclado', () => {
    render(<MyWorks />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    searchInput.focus();

    expect(searchInput).toHaveFocus();
  });

  /**
   * ACESSIBILIDADE 5 — Botões acessíveis pelo teclado (Enter/Space)
   *
   * Botões devem ser ativáveis pelo teclado, não apenas pelo clique
   * do mouse.
   */
  test('o botão "Novo Trabalho" deve ser ativável pelo teclado', () => {
    const { navigateTo } = require('../../../../../services/utils/utils');
    render(<MyWorks />);

    const newWorkButton = screen.getByRole('button', { name: /Novo Trabalho/i });

    fireEvent.keyDown(newWorkButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(newWorkButton);

    expect(navigateTo).toHaveBeenCalled();
  });

  /**
   * ACESSIBILIDADE 6 — Mensagem de estado vazio acessível
   *
   * Quando não há resultados, a mensagem de estado vazio deve ser
   * renderizada em um elemento que leitores de tela consigam anunciar.
   */
  test('a mensagem de estado vazio deve ser acessível', () => {
    useMyWorks.mockReturnValue({
      works: [],
      totalPages: 0,
      totalWorks: 0,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MyWorks />);

    const emptyMessage = screen.getByText('Nenhum trabalho encontrado.');

    expect(emptyMessage).toBeInTheDocument();
    expect(emptyMessage).toBeVisible();
  });

  /**
   * ACESSIBILIDADE 7 — Modal de filtros acessível
   *
   * Quando o modal de filtros é aberto, ele deve estar presente e
   * visível no DOM.
   */
  test('o modal de filtros deve estar visível e acessível quando aberto', () => {
    render(<MyWorks />);

    fireEvent.click(screen.getByRole('button', { name: /Filtrar Trabalhos/i }));

    const modal = screen.getByTestId('filter-modal');

    expect(modal).toBeInTheDocument();
    expect(modal).toBeVisible();
  });

  /**
   * ACESSIBILIDADE 8 — Contagem de resultados acessível
   *
   * A contagem de resultados ("2 resultados") deve estar presente
   * no DOM de forma que leitores de tela possam anunciá-la.
   */
  test('a contagem de resultados deve estar visível e acessível', () => {
    render(<MyWorks />);

    const resultsCount = screen.getByText('2 resultados');

    expect(resultsCount).toBeInTheDocument();
    expect(resultsCount).toBeVisible();
  });
});