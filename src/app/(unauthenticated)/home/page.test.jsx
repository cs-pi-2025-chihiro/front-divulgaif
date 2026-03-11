import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Home from "./page";

// Define mock functions at the top level
const mockNavigate = jest.fn();
const mockHandleOAuthCallback = jest.fn();
const mockUseHome = jest.fn();
const mockUseAtom = jest.fn();
const mockUseTranslation = jest.fn();

// Mock dependencies
jest.mock("react-i18next", () => ({
  useTranslation: () => mockUseTranslation(),
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));

jest.mock("../../../i18n", () => ({
  language: "pt",
  changeLanguage: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("./useHome", () => ({
  useHome: (...args) => mockUseHome(...args),
  pageAtom: { toString: () => "pageAtom" },
  sizeAtom: { toString: () => "sizeAtom" },
  searchAtom: { toString: () => "searchAtom" },
}));

jest.mock("jotai", () => ({
  useAtom: (atom) => mockUseAtom(atom),
  atom: jest.fn(),
}));

jest.mock("../login/useSuap", () => ({
  __esModule: true,
  default: () => ({
    handleOAuthCallback: mockHandleOAuthCallback,
  }),
}));

jest.mock("../../../components/input", () => ({
  SearchInput: ({ value, onChange, placeholder, className }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

jest.mock("../../../components/button", () => ({
  __esModule: true,
  default: ({ children, onClick, variant, size, className }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

jest.mock("../../../components/paginated-results/paginated-results", () => ({
  __esModule: true,
  default: ({
    content,
    totalPages,
    isLoading,
    currentPage,
    setCurrentPage,
    totalElements,
    refetch,
  }) => (
    <div data-testid="paginated-results">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div data-testid="works-count">{content.length} works</div>
          <div data-testid="total-elements">{totalElements} total</div>
          <div data-testid="total-pages">{totalPages} pages</div>
        </>
      )}
    </div>
  ),
}));

jest.mock("../../../components/modal/filtrar-busca/filtrarBuscaModal", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onApplyFilters }) =>
    isOpen ? (
      <div data-testid="filter-modal">
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="apply-filters"
          onClick={() => onApplyFilters({ workType: { article: true } })}
        >
          Apply
        </button>
      </div>
    ) : null,
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Globe: () => <div data-testid="globe-icon" />,
  Code2: () => <div data-testid="code-icon" />,
  Users: () => <div data-testid="users-icon" />,
  GraduationCap: () => <div data-testid="graduation-icon" />,
  Building2: () => <div data-testid="building-icon" />,
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

describe("Home Component", () => {
  let mockRefetch;
  let mockSetCurrentPage;
  let mockSetCurrentSize;
  let mockSetSearch;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Configure default i18n mock
    mockUseTranslation.mockReturnValue({
      t: (key, defaultValue) => defaultValue || key,
      i18n: { language: "pt" },
    });

    mockRefetch = jest.fn();
    mockSetCurrentPage = jest.fn();
    mockSetCurrentSize = jest.fn();
    mockSetSearch = jest.fn();

    // Mock useAtom to return state and setter
    mockUseAtom.mockImplementation((atom) => {
      const atomString = atom.toString();
      if (atomString === "pageAtom") {
        return [0, mockSetCurrentPage];
      }
      if (atomString === "sizeAtom") {
        return [10, mockSetCurrentSize];
      }
      if (atomString === "searchAtom") {
        return ["", mockSetSearch];
      }
      return [null, jest.fn()];
    });

    // Mock useHome with default values
    mockUseHome.mockReturnValue({
      works: [
        { id: 1, title: "Test Work 1" },
        { id: 2, title: "Test Work 2" },
      ],
      totalWorks: 2,
      totalPages: 1,
      isLoading: false,
      refetch: mockRefetch,
    });
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {component}
      </BrowserRouter>,
    );
  };

  describe("Unit Tests - Rendering", () => {
    test("renders home page with title", () => {
      renderWithRouter(<Home />);
      expect(
        screen.getByText(
          /Uma Plataforma Feita pela Comunidade, para a Comunidade/i,
        ),
      ).toBeInTheDocument();
    });

    test("renders search input", () => {
      renderWithRouter(<Home />);
      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toBeInTheDocument();
    });

    test("renders filter button", () => {
      renderWithRouter(<Home />);
      const filterButton = screen.getByText(/common\.filter/i);
      expect(filterButton).toBeInTheDocument();
    });

    test("renders new work button", () => {
      renderWithRouter(<Home />);
      const newWorkButton = screen.getByText(/home\.newWork/i);
      expect(newWorkButton).toBeInTheDocument();
    });

    test("renders paginated results", () => {
      renderWithRouter(<Home />);
      const paginatedResults = screen.getByTestId("paginated-results");
      expect(paginatedResults).toBeInTheDocument();
    });

    test("renders community section", () => {
      renderWithRouter(<Home />);
      expect(
        screen.getByRole("heading", { name: /Acesso Aberto/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Código Aberto/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Colaborativo/i }),
      ).toBeInTheDocument();
    });

    test("renders FAQ section", () => {
      renderWithRouter(<Home />);
      expect(screen.getByText(/Perguntas Frequentes/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Quem pode usar o DivulgaIF?/i),
      ).toBeInTheDocument();
    });

    test("renders IFPR project section", () => {
      renderWithRouter(<Home />);
      expect(screen.getByText(/Um Projeto do IFPR/i)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Instituto Federal do Paraná/i }),
      ).toBeInTheDocument();
    });

    test("renders CTA section", () => {
      renderWithRouter(<Home />);
      expect(screen.getByText(/Pronto para começar?/i)).toBeInTheDocument();
      expect(screen.getByText(/Publicar Trabalho/i)).toBeInTheDocument();
    });

    test("displays correct number of works", () => {
      renderWithRouter(<Home />);
      expect(screen.getByTestId("works-count")).toHaveTextContent("2 works");
      expect(screen.getByTestId("total-elements")).toHaveTextContent("2 total");
    });
  });

  describe("Unit Tests - OAuth Callback", () => {
    test("calls handleOAuthCallback on mount", () => {
      renderWithRouter(<Home />);
      expect(mockHandleOAuthCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("Integration Tests - User Interactions", () => {
    test("handles search input change", async () => {
      renderWithRouter(<Home />);
      const searchInput = screen.getByTestId("search-input");

      await userEvent.type(searchInput, "test search");

      await waitFor(() => {
        expect(mockSetSearch).toHaveBeenCalled();
      });
    });

    test("resets page when search changes", async () => {
      renderWithRouter(<Home />);
      const searchInput = screen.getByTestId("search-input");

      await userEvent.type(searchInput, "new search");

      await waitFor(() => {
        expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
      });
    });

    test("opens filter modal when filter button is clicked", async () => {
      renderWithRouter(<Home />);
      const filterButton = screen.getByText(/common\.filter/i);

      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(screen.getByTestId("filter-modal")).toBeInTheDocument();
      });
    });

    test("closes filter modal when close button is clicked", async () => {
      renderWithRouter(<Home />);
      const filterButton = screen.getByText(/common\.filter/i);

      fireEvent.click(filterButton);

      const closeButton = screen.getByTestId("close-modal");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
      });
    });

    test("applies filters when apply button is clicked", async () => {
      renderWithRouter(<Home />);
      const filterButton = screen.getByText(/common\.filter/i);

      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId("apply-filters");
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
      });
    });

    test("navigates to new work page when new work button is clicked", () => {
      renderWithRouter(<Home />);
      const newWorkButton = screen.getByText(/home\.newWork/i);

      fireEvent.click(newWorkButton);

      expect(mockNavigate).toHaveBeenCalledWith("/pt/trabalho/novo");
    });

    test("navigates to publish work when CTA button is clicked", () => {
      renderWithRouter(<Home />);
      const ctaButton = screen.getByRole("button", {
        name: /Publicar Trabalho/i,
      });

      fireEvent.click(ctaButton);

      expect(mockNavigate).toHaveBeenCalledWith("/pt/trabalho/novo");
    });
  });

  describe("Integration Tests - Loading State", () => {
    test("displays loading state", () => {
      mockUseHome.mockReturnValue({
        works: [],
        totalWorks: 0,
        totalPages: 0,
        isLoading: true,
        refetch: mockRefetch,
      });

      renderWithRouter(<Home />);
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    test("displays empty state when no works", () => {
      mockUseHome.mockReturnValue({
        works: [],
        totalWorks: 0,
        totalPages: 0,
        isLoading: false,
        refetch: mockRefetch,
      });

      renderWithRouter(<Home />);
      expect(screen.getByTestId("works-count")).toHaveTextContent("0 works");
    });
  });

  describe("Integration Tests - Filter Application", () => {
    test("applies work type filter correctly", async () => {
      renderWithRouter(<Home />);

      const filterButton = screen.getByText(/common\.filter/i);
      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId("apply-filters");
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
      });
    });

    test("handles multiple filters simultaneously", async () => {
      const mockOnApplyFilters = jest.fn();

      require("../../../components/modal/filtrar-busca/filtrarBuscaModal").default =
        ({ isOpen, onClose, onApplyFilters }) =>
          isOpen ? (
            <div data-testid="filter-modal">
              <button
                data-testid="apply-complex-filters"
                onClick={() =>
                  onApplyFilters({
                    workType: { article: true, book: true },
                    labels: ["label1", "label2"],
                    period: { startDate: "2024-01-01", endDate: "2024-12-31" },
                  })
                }
              >
                Apply Complex
              </button>
            </div>
          ) : null;

      renderWithRouter(<Home />);

      const filterButton = screen.getByText(/common\.filter/i);
      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId("apply-complex-filters");
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
      });
    });
  });

  describe("Unit Tests - Accessibility", () => {
    test("search input has placeholder", () => {
      renderWithRouter(<Home />);
      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toHaveAttribute("placeholder");
    });

    test("all icons are rendered", () => {
      renderWithRouter(<Home />);
      expect(screen.getByTestId("globe-icon")).toBeInTheDocument();
      expect(screen.getByTestId("code-icon")).toBeInTheDocument();
      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
      expect(screen.getByTestId("building-icon")).toBeInTheDocument();
    });
  });

  describe("Integration Tests - Language Support", () => {
    test("navigates with English language", () => {
      // Override mock for this test only
      mockUseTranslation.mockReturnValue({
        t: (key, defaultValue) => defaultValue || key,
        i18n: { language: "en" },
      });
      require("../../../i18n").language = "en";

      renderWithRouter(<Home />);
      const newWorkButton = screen.getByText(/home\.newWork/i);

      fireEvent.click(newWorkButton);

      expect(mockNavigate).toHaveBeenCalledWith("/en/work/new");
    });
  });

  describe("Integration Tests - Data Updates", () => {
    test("updates when works data changes", () => {
      const { rerender } = renderWithRouter(<Home />);

      expect(screen.getByTestId("works-count")).toHaveTextContent("2 works");

      // Update mock to return different data
      mockUseHome.mockReturnValue({
        works: [
          { id: 1, title: "Work 1" },
          { id: 2, title: "Work 2" },
          { id: 3, title: "Work 3" },
        ],
        totalWorks: 3,
        totalPages: 1,
        isLoading: false,
        refetch: mockRefetch,
      });

      rerender(
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Home />
        </BrowserRouter>,
      );

      expect(screen.getByTestId("works-count")).toHaveTextContent("3 works");
    });
  });
});
