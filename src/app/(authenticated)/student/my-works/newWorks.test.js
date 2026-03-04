// src/app/(authenticated)/student/my-works/newWorks.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// -------------------- Mocks (DEVEM VIR ANTES DO IMPORT DO COMPONENTE) --------------------

// i18n
let mockLang = "pt";
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: mockLang } }),
}));

// router
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// lucide icons
jest.mock("lucide-react", () => ({
  Filter: () => <span data-testid="icon-filter" />,
  Plus: () => <span data-testid="icon-plus" />,
}));

// utils
jest.mock("../../../../services/utils/utils", () => ({
  __esModule: true,
  navigateTo: jest.fn(),
  mapPaginationValues: jest.fn(),
}));
import { navigateTo, mapPaginationValues } from "../../../../services/utils/utils";

// hook local + atoms (simplificado)
jest.mock("./useMyWorks", () => ({
  __esModule: true,
  useMyWorks: () => ({
    works: [],
    totalPages: 0,
    totalWorks: 0,
    isLoading: false,
    refetch: jest.fn(),
  }),
  pageAtom: {},
  searchAtom: {},
  sizeAtom: {},
}));

// jotai
const mockSetAtom = jest.fn();
jest.mock("jotai", () => ({
  useAtom: () => [0, mockSetAtom],
}));

// componentes
jest.mock("../../../../components/button", () => (props) => (
  <button onClick={props.onClick}>{props.children}</button>
));

jest.mock("../../../../components/input", () => ({
  SearchInput: (props) => (
    <input
      data-testid="search-input"
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
    />
  ),
}));

jest.mock("../../../../components/paginated-results/paginated-results", () => (props) => (
  <div data-testid="paginated-results">
    items:{props.content?.length ?? 0} loading:{String(props.isLoading)} pages:
    {String(props.totalPages)} total:{String(props.totalElements)}
  </div>
));

// Modal com ações para fechar e aplicar filtros
jest.mock("../../../../components/modal/filtrar-busca/filtrarBuscaModal", () => (props) => {
  if (!props.isOpen) return null;
  return (
    <div data-testid="filter-modal">
      <button onClick={props.onClose}>close-modal</button>
      <button
        onClick={() =>
          props.onApplyFilters({
            workType: { article: true },
            workStatus: { published: true },
            labels: "label1",
            period: { startDate: "2026-01-01", endDate: "2026-02-01" },
            pagination: { size: 50 },
            order: "desc",
          })
        }
      >
        apply-filters
      </button>
    </div>
  );
});

// IMPORT DO COMPONENTE (depois dos mocks)
import MyWorks from "./page";

// -------------------- Tests --------------------

describe("MyWorks (page.jsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLang = "pt";
  });

  // -------- Testes existentes --------
  test("renderiza título e botões", () => {
    render(<MyWorks />);
    expect(screen.getByText("header.myWorks")).toBeInTheDocument();
    expect(screen.getByText("filters.filterSearch")).toBeInTheDocument();
    expect(screen.getByText("home.newWork")).toBeInTheDocument();
  });

  test("abre modal ao clicar no botão de filtro", () => {
    render(<MyWorks />);
    fireEvent.click(screen.getByText("filters.filterSearch"));
    expect(screen.getByTestId("filter-modal")).toBeInTheDocument();
  });

  test("clica em Novo Trabalho e chama navigateTo com rota pt", () => {
    render(<MyWorks />);
    fireEvent.click(screen.getByText("home.newWork"));
    expect(navigateTo).toHaveBeenCalledWith("trabalho/novo", mockNavigate, "pt");
  });

  test("clica em Novo Trabalho e chama navigateTo com rota en", () => {
    mockLang = "en";
    render(<MyWorks />);
    fireEvent.click(screen.getByText("home.newWork"));
    expect(navigateTo).toHaveBeenCalledWith("work/new", mockNavigate, "en");
  });

  test("altera o campo de busca (chama setter do atom)", () => {
    render(<MyWorks />);
    fireEvent.change(screen.getByTestId("search-input"), {
      target: { value: "abc" },
    });
    expect(mockSetAtom).toHaveBeenCalled();
  });

  test("renderiza PaginatedResults com lista vazia", () => {
    render(<MyWorks />);
    expect(screen.getByTestId("paginated-results")).toHaveTextContent("items:0");
  });

  // -------- Novos testes adicionados --------

  test("fecha o modal ao clicar no botão close do modal", () => {
    render(<MyWorks />);
    fireEvent.click(screen.getByText("filters.filterSearch"));
    expect(screen.getByTestId("filter-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-modal"));
    expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
  });

  test("aplica filtros: chama mapPaginationValues e fecha o modal", () => {
    render(<MyWorks />);

    fireEvent.click(screen.getByText("filters.filterSearch"));
    expect(screen.getByTestId("filter-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("apply-filters"));

    expect(mapPaginationValues).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
  });

  test("ao clicar em filtro 2x: abre e depois fecha (toggle)", () => {
    render(<MyWorks />);

    fireEvent.click(screen.getByText("filters.filterSearch"));
    expect(screen.getByTestId("filter-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("filters.filterSearch"));
    expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
  });

  test("placeholder do search contém 'common.search...'", () => {
    render(<MyWorks />);
    expect(screen.getByTestId("search-input")).toHaveAttribute(
      "placeholder",
      "common.search..."
    );
  });
});