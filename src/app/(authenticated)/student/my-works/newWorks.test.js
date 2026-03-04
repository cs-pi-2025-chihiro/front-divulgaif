// src/app/(authenticated)/student/my-works/newWorks.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MyWorks from "./page";

// -------------------- Mocks --------------------

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

// utils (sem variável fora de escopo)
jest.mock("../../../../services/utils/utils", () => ({
  __esModule: true,
  navigateTo: jest.fn(),
  mapPaginationValues: jest.fn(),
}));
import { navigateTo } from "../../../../services/utils/utils";

// hook local + atoms (CORRETO: caminho relativo é ./useMyWorks)
jest.mock("./useMyWorks", () => {
  return {
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
  };
});

// jotai: devolve o formato esperado [valor, setter]
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
  <div data-testid="paginated-results">items:{props.content?.length ?? 0}</div>
));

jest.mock(
  "../../../../components/modal/filtrar-busca/filtrarBuscaModal",
  () => (props) => (props.isOpen ? <div data-testid="filter-modal" /> : null)
);

// -------------------- Tests --------------------

describe("MyWorks (page.jsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLang = "pt";
  });

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

    // como mockamos useAtom com setter único, pelo menos validamos que ele foi chamado
    expect(mockSetAtom).toHaveBeenCalled();
  });

  test("renderiza PaginatedResults com lista vazia", () => {
    render(<MyWorks />);
    expect(screen.getByTestId("paginated-results")).toHaveTextContent("items:0");
  });
});