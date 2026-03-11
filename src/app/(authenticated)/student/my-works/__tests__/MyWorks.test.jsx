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

describe('Página Meus Trabalhos - Testes Adicionais', () => {
  const mockNavigate = jest.fn();
  const mockSetCurrentPage = jest.fn();
  const mockSetCurrentSize = jest.fn();
  const mockSetSearch = jest.fn();
  const mockRefetch = jest.fn();

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
      works: mockWorks,
      totalPages: 1,
      totalWorks: 2,
      isLoading: false,
      refetch: mockRefetch,
    });
  });

  //////////////////
  
  test('deve aplicar filtros e fechar o modal', () => {
    render(<MyWorks />);

    fireEvent.click(screen.getByText('Filtrar Trabalhos'));
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Aplicar'));

    // Após aplicar, o modal deve fechar e a página deve ser resetada
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
    expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
  });

  
  test('deve exibir os autores dos trabalhos', () => {
    render(<MyWorks />);

    expect(screen.getByText('Autor 1')).toBeInTheDocument();
    expect(screen.getByText('Autor 2')).toBeInTheDocument();
  });

  
  test('deve exibir as labels dos trabalhos', () => {
    render(<MyWorks />);

    expect(screen.getByText('IA')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Testes')).toBeInTheDocument();
  });

  
  test('deve exibir a descrição dos trabalhos', () => {
    render(<MyWorks />);

    expect(screen.getByText('Descrição do trabalho 1')).toBeInTheDocument();
    expect(screen.getByText('Descrição do trabalho 2')).toBeInTheDocument();
  });


  test('deve fechar o modal ao clicar no botão fechar', () => {
    render(<MyWorks />);

    fireEvent.click(screen.getByText('Filtrar Trabalhos'));
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar'));

    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
  });

  test('deve mostrar texto singular quando houver apenas 1 resultado', () => {
    useMyWorks.mockReturnValue({
      works: [mockWorks[0]],
      totalPages: 1,
      totalWorks: 1,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MyWorks />);

    expect(screen.getByText('1 resultado')).toBeInTheDocument();
  });


  test('deve exibir a data de aprovação dos trabalhos', () => {
    render(<MyWorks />);
    expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0);
  });
});