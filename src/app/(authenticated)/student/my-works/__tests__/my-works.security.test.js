import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// -------------------- Mocks (antes do import do componente) --------------------

let mockLang = "pt";

const mockNavigate = jest.fn();
const mockNavigateTo = jest.fn();
const mockMapPaginationValues = jest.fn();
const mockUseMyWorks = jest.fn();

const mockSetPage = jest.fn();
const mockSetSize = jest.fn();
const mockSetSearch = jest.fn();

const mockUseAtom = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: mockLang },
  }),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("lucide-react", () => ({
  Filter: () => <span data-testid="icon-filter" />,
  Plus: () => <span data-testid="icon-plus" />,
}));

jest.mock("../useMyWorks", () => ({
  __esModule: true,
  pageAtom: {},
  sizeAtom: {},
  searchAtom: {},
  useMyWorks: (...args) => mockUseMyWorks(...args),
}));

jest.mock("jotai", () => ({
  useAtom: (...args) => mockUseAtom(...args),
}));

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

jest.mock(
  "../../../../components/paginated-results/paginated-results",
  () => (props) => (
    <div data-testid="paginated-results">
      <div>count:{Array.isArray(props.content) ? props.content.length : 0}</div>
      <div>loading:{String(props.isLoading)}</div>

      {Array.isArray(props.content) &&
        props.content.map((item) => (
          <div key={item.id ?? item.title}>
            <span>{item.title}</span>
            <span>{item.description}</span>
          </div>
        ))}
    </div>
  )
);

jest.mock(
  "../../../../components/modal/filtrar-busca/filtrarBuscaModal",
  () => (props) => {
    if (!props.isOpen) return null;

    return (
      <div data-testid="filter-modal">
        <button onClick={props.onClose}>close-modal</button>
        <button
          onClick={() =>
            props.onApplyFilters({
              workType: { article: true },
              workStatus: { published: true },
              labels: "<img src=x onerror=alert(1)>",
              period: { startDate: "2026-01-01", endDate: "2026-02-01" },
              pagination: { size: 50 },
              order: "desc",
            })
          }
        >
          apply-malicious-filters
        </button>
      </div>
    );
  }
);

// -------------------- Import do componente (depois dos mocks) --------------------

import MyWorksPage from "../page";

// -------------------- Helpers --------------------

function setupAtoms({ page = 0, size = 10, search = "" } = {}) {
  mockUseAtom.mockReset();
  mockUseAtom
    .mockImplementationOnce(() => [page, mockSetPage])
    .mockImplementationOnce(() => [size, mockSetSize])
    .mockImplementationOnce(() => [search, mockSetSearch]);
}

function renderPage(hookOverride = {}) {
  setupAtoms();

  mockUseMyWorks.mockReturnValue({
    works: [],
    totalPages: 0,
    totalWorks: 0,
    isLoading: false,
    refetch: jest.fn(),
    ...hookOverride,
  });

  return render(<MyWorksPage />);
}

// -------------------- Tests --------------------

describe("Security Suite - My Works (Real Component Testing)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLang = "pt";
  });

  /**
   * ID: SEC-001
   * Categoria: OWASP A03:2021 - Injection
   * Subcategoria: XSS
   * Arquivo-alvo: src/app/(authenticated)/student/my-works/page.jsx
   * Tipo: input-validation
   */
  test("[SEC-001] deve tratar payload de script como texto no campo de busca", () => {
    renderPage();

    const input = screen.getByTestId("search-input");
    const payload = "<script>alert('xss')</script>";

    fireEvent.change(input, { target: { value: payload } });

    expect(mockSetSearch).toHaveBeenCalledWith(payload);
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });

  /**
   * ID: SEC-002
   * Categoria: OWASP A03:2021 - Injection
   * Subcategoria: HTML Injection
   * Arquivo-alvo: src/app/(authenticated)/student/my-works/page.jsx
   * Tipo: input-validation
   */
  test("[SEC-002] deve tratar payload HTML como texto no campo de busca", () => {
    renderPage();

    const input = screen.getByTestId("search-input");
    const payload = "<img src=x onerror=alert(1)>";

    fireEvent.change(input, { target: { value: payload } });

    expect(mockSetSearch).toHaveBeenCalledWith(payload);
    expect(document.querySelector("img[onerror]")).toBeNull();
  });

  /**
   * ID: SEC-003
   * Categoria: OWASP A03:2021 - Injection
   * Subcategoria: Stored XSS / HTML Injection
   * Arquivo-alvo: src/app/(authenticated)/student/my-works/page.jsx
   * Tipo: render-validation
   */
  test("[SEC-003] deve renderizar conteúdo vindo da API como texto seguro", () => {
    renderPage({
      works: [
        {
          id: 1,
          title: "Trabalho malicioso",
          description: "<nav onmouseover=alert(1)>Critical Description</nav>",
        },
      ],
    });

    expect(screen.getByText("Trabalho malicioso")).toBeInTheDocument();
    expect(
      screen.getByText("<nav onmouseover=alert(1)>Critical Description</nav>")
    ).toBeInTheDocument();
    expect(document.querySelector("nav")).toBeNull();
  });

  /**
   * ID: SEC-004
   * Categoria: OWASP A01:2021 - Broken Access Control
   * Subcategoria: Parameter Tampering
   * Arquivo-alvo: src/app/(authenticated)/student/my-works/page.jsx
   * Tipo: logic-test
   */
  test("[SEC-004] deve aplicar filtros maliciosos sem quebrar a página", () => {
    renderPage();

    fireEvent.click(screen.getByText("filters.filterSearch"));
    expect(screen.getByTestId("filter-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("apply-malicious-filters"));

    expect(mockMapPaginationValues).toHaveBeenCalledTimes(1);
    expect(mockSetPage).toHaveBeenCalledWith(0);
    expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
  });

  /**
   * ID: SEC-005
   * Categoria: OWASP A04:2021 - Insecure Design
   * Subcategoria: UI Robustness
   * Arquivo-alvo: src/app/(authenticated)/student/my-works/page.jsx
   * Tipo: ui-security
   */
  test("[SEC-005] deve fechar o modal ao clicar fora", () => {
    renderPage();

    fireEvent.click(screen.getByText("filters.filterSearch"));
    expect(screen.getByTestId("filter-modal")).toBeInTheDocument();

    fireEvent.click(document.body);

    expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
  });

  /**
   * ID: SEC-006
   * Categoria: OWASP A01:2021 - Broken Access Control
   * Subcategoria: Insecure Navigation
   * Arquivo-alvo: src/app/(authenticated)/student/my-works/page.jsx
   * Tipo: navigation-security
   */
  test("[SEC-006] deve navegar apenas para rota interna segura em português", () => {
    renderPage();

    fireEvent.click(screen.getByText("home.newWork"));

    expect(mockNavigateTo).toHaveBeenCalledWith(
      "trabalho/novo",
      mockNavigate,
      "pt"
    );
  });

  /**
   * ID: SEC-007
   * Categoria: OWASP A01:2021 - Broken Access Control
   * Subcategoria: Insecure Navigation
   * Arquivo-alvo: src/app/(authenticated)/student/my-works/page.jsx
   * Tipo: navigation-security
   */
  test("[SEC-007] deve navegar apenas para rota interna segura em inglês", () => {
    mockLang = "en";
    renderPage();

    fireEvent.click(screen.getByText("home.newWork"));

    expect(mockNavigateTo).toHaveBeenCalledWith(
      "work/new",
      mockNavigate,
      "en"
    );
  });

  /**
   * ID: SEC-008
   * Categoria: OWASP A04:2021 - Insecure Design
   * Subcategoria: Robustness / Null Handling
   * Arquivo-alvo: src/app/(authenticated)/student/my-works/page.jsx
   * Tipo: robustness-test
   */
  test("[SEC-008] deve continuar renderizando com dados nulos ou indefinidos vindos do hook", () => {
    renderPage({
      works: undefined,
      totalPages: undefined,
      totalWorks: undefined,
      isLoading: false,
    });

    expect(screen.getByTestId("paginated-results")).toBeInTheDocument();
  });
});