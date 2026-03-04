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

describe('Página Meus Trabalhos - Testes de Interface', () => {
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
    }
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

  test('deve renderizar os componentes principais da página', () => {
    render(<MyWorks />);

    expect(screen.getByText('Meus Trabalhos')).toBeInTheDocument();
    expect(screen.getByText('Filtrar Trabalhos')).toBeInTheDocument();
    expect(screen.getByText('Novo Trabalho')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  test('deve renderizar a lista de trabalhos quando populada', () => {
    render(<MyWorks />);

    expect(screen.getByText('Trabalho de Teste 1')).toBeInTheDocument();
    expect(screen.getByText('Trabalho de Teste 2')).toBeInTheDocument();
    expect(screen.getByText('2 resultados')).toBeInTheDocument();
  });

  test('deve exibir mensagem de erro quando a lista de trabalhos está vazia', () => {
    useMyWorks.mockReturnValue({
      works: [],
      totalPages: 0,
      totalWorks: 0,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MyWorks />);

    expect(screen.getByText('Nenhum trabalho encontrado.')).toBeInTheDocument();
    expect(screen.getByText('0 resultados')).toBeInTheDocument();
  });

  test('deve navegar para a página de novo trabalho ao clicar no botão', () => {
    const { navigateTo } = require('../../../../../services/utils/utils');
    render(<MyWorks />);

    const newWorkButton = screen.getByText('Novo Trabalho');
    fireEvent.click(newWorkButton);

    expect(navigateTo).toHaveBeenCalledWith('trabalho/novo', mockNavigate, 'pt');
  });

  
  test('deve abrir o modal de filtros ao clicar no botão de filtrar', () => {
    render(<MyWorks />);

    const filterButton = screen.getByText('Filtrar Trabalhos');
    fireEvent.click(filterButton);

    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
  });

  test('deve atualizar o termo de busca e resetar a página ao digitar no campo de busca', () => {
    render(<MyWorks />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'Pesquisa' } });

    expect(mockSetSearch).toHaveBeenCalledWith('Pesquisa');
    expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
  });

  
  test('não deve resetar a página se o termo de busca for igual ao anterior', () => {
    useAtom.mockImplementation((atom) => {
      if (atom === pageAtom)   return [0, mockSetCurrentPage];
      if (atom === sizeAtom)   return [10, mockSetCurrentSize];
      if (atom === searchAtom) return ['Pesquisa', mockSetSearch];
      return [null, jest.fn()];
    });

    render(<MyWorks />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'Pesquisa' } });
    expect(mockSetCurrentPage).not.toHaveBeenCalled();
  });

  test('deve exibir estado de carregamento enquanto os dados são buscados', () => {
    useMyWorks.mockReturnValue({
      works: [],
      totalPages: 0,
      totalWorks: 0,
      isLoading: true,
      refetch: mockRefetch,
    });

    render(<MyWorks />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });
});