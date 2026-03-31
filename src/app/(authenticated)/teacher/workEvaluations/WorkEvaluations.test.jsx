import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import WorkEvaluations from "./page";
import {
  pageAtom,
  searchAtom,
  sizeAtom,
  useWorkEvaluations,
} from "./useWorkEvaluations";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { mapPaginationValues, navigateTo } from "../../../../services/utils/utils";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("./useWorkEvaluations", () => {
  const actual = jest.requireActual("./useWorkEvaluations");
  return {
    ...actual,
    useWorkEvaluations: jest.fn(),
  };
});

jest.mock("jotai", () => ({
  useAtom: jest.fn(),
  atom: jest.fn((initialValue) => ({
    toString: () => `atom(${initialValue})`,
    init: initialValue,
  })),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../../../services/utils/utils", () => ({
  navigateTo: jest.fn(),
  mapPaginationValues: jest.fn(),
}));

// Stub out CSS files
jest.mock("./page.css", () => ({}), { virtual: true });

// Mock complex child components to focus tests on the page's own logic
jest.mock("../../../../components/modal/filtrar-busca/filtrarBuscaModal", () => {
  return function MockFiltrarBuscaModal({ isOpen, onClose, onApplyFilters, showStatus }) {
    if (!isOpen) return null;
    return (
      <div data-testid="filter-modal">
        <button data-testid="close-modal-btn" onClick={onClose}>
          Fechar
        </button>
        <button
          data-testid="apply-filters-btn"
          onClick={() =>
            onApplyFilters({
              workType: { article: true },
              labels: "AI",
              period: { startDate: "2024-01-01", endDate: "2024-12-31" },
              pagination: "10",
              order: "ASC",
            })
          }
        >
          Aplicar
        </button>
        <button
          data-testid="apply-empty-filters-btn"
          onClick={() => onApplyFilters({})}
        >
          Aplicar Vazio
        </button>
        <button
          data-testid="apply-worktype-false-btn"
          onClick={() =>
            onApplyFilters({ workType: { article: false, thesis: false } })
          }
        >
          Aplicar workType Falso
        </button>
      </div>
    );
  };
});

jest.mock("../../../../components/paginated-results/paginated-results", () => {
  return function MockPaginatedResults({
    content,
    totalPages,
    isLoading,
    currentPage,
    setCurrentPage,
    totalElements,
    refetch,
  }) {
    return (
      <div data-testid="paginated-results">
        <span data-testid="total-elements">{totalElements}</span>
        <span data-testid="is-loading">{String(isLoading)}</span>
        <span data-testid="current-page">{currentPage}</span>
        {isLoading ? (
          <span>Carregando...</span>
        ) : (
          content.map((w) => (
            <div key={w.id} data-testid={`work-${w.id}`}>
              {w.title}
            </div>
          ))
        )}
      </div>
    );
  };
});

jest.mock("../../../../components/input", () => ({
  SearchInput: function MockSearchInput({ value, onChange, placeholder }) {
    return (
      <input
        data-testid="search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  },
}));

jest.mock("../../../../components/button", () => {
  return function MockButton({ onClick, children, className, size }) {
    return (
      <button data-testid="mock-button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  };
});

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const mockWorks = [
  { id: "1", title: "Work A", authors: [], description: "desc A", labels: [] },
  { id: "2", title: "Work B", authors: [], description: "desc B", labels: [] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockNavigate = jest.fn();
const mockSetCurrentPage = jest.fn();
const mockSetCurrentSize = jest.fn();
const mockSetSearch = jest.fn();
const mockRefetch = jest.fn();

function setupMocks({
  works = mockWorks,
  totalPages = 1,
  totalWorks = 2,
  isLoading = false,
  currentPage = 0,
  currentSize = 10,
  search = "",
  lang = "pt",
} = {}) {
  useNavigate.mockReturnValue(mockNavigate);

  useTranslation.mockReturnValue({
    t: (key) => key,
    i18n: { language: lang },
  });

  useAtom.mockImplementation((atom) => {
    if (atom === pageAtom) return [currentPage, mockSetCurrentPage];
    if (atom === sizeAtom) return [currentSize, mockSetCurrentSize];
    if (atom === searchAtom) return [search, mockSetSearch];
    return [null, jest.fn()];
  });

  useWorkEvaluations.mockReturnValue({
    works,
    totalPages,
    totalWorks,
    isLoading,
    refetch: mockRefetch,
  });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("WorkEvaluations page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe("initial rendering", () => {
    it("renders the page title", () => {
      setupMocks();
      render(<WorkEvaluations />);
      expect(screen.getByText("header.rateWorks")).toBeInTheDocument();
    });

    it("renders the filter button", () => {
      setupMocks();
      render(<WorkEvaluations />);
      expect(screen.getByText("filters.filterSearch")).toBeInTheDocument();
    });

    it("renders the search input with correct placeholder", () => {
      setupMocks();
      render(<WorkEvaluations />);
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(screen.getByTestId("search-input")).toHaveAttribute(
        "placeholder",
        "common.search..."
      );
    });

    it("renders the PaginatedResults component", () => {
      setupMocks();
      render(<WorkEvaluations />);
      expect(screen.getByTestId("paginated-results")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  describe("loading state", () => {
    it("passes isLoading=true to PaginatedResults when loading", () => {
      setupMocks({ isLoading: true, works: [] });
      render(<WorkEvaluations />);
      expect(screen.getByTestId("is-loading")).toHaveTextContent("true");
      expect(screen.getByText("Carregando...")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Populated state
  // -------------------------------------------------------------------------

  describe("populated state", () => {
    it("passes works to PaginatedResults", () => {
      setupMocks();
      render(<WorkEvaluations />);
      expect(screen.getByTestId("total-elements")).toHaveTextContent("2");
      expect(screen.getByTestId("work-1")).toHaveTextContent("Work A");
      expect(screen.getByTestId("work-2")).toHaveTextContent("Work B");
    });
  });

  // -------------------------------------------------------------------------
  // Filter modal
  // -------------------------------------------------------------------------

  describe("filter modal", () => {
    it("filter modal is hidden by default", () => {
      setupMocks();
      render(<WorkEvaluations />);
      expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
    });

    it("opens the filter modal when the filter button is clicked", () => {
      setupMocks();
      render(<WorkEvaluations />);
      fireEvent.click(screen.getByText("filters.filterSearch"));
      expect(screen.getByTestId("filter-modal")).toBeInTheDocument();
    });

    it("stops event propagation when filter button is clicked (does not trigger outside-click handler)", () => {
      setupMocks();
      render(<WorkEvaluations />);
      // Click the filter button – it calls e.stopPropagation() so the document
      // listener should not immediately close the modal.
      fireEvent.click(screen.getByText("filters.filterSearch"));
      expect(screen.getByTestId("filter-modal")).toBeInTheDocument();
    });

    it("closes the filter modal when the close button inside the modal is clicked", () => {
      setupMocks();
      render(<WorkEvaluations />);
      fireEvent.click(screen.getByText("filters.filterSearch"));
      fireEvent.click(screen.getByTestId("close-modal-btn"));
      expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
    });

    it("closes the filter modal when clicking outside (.filter-dropdown is absent)", () => {
      setupMocks();
      render(<WorkEvaluations />);
      fireEvent.click(screen.getByText("filters.filterSearch"));
      expect(screen.getByTestId("filter-modal")).toBeInTheDocument();

      // Simulate a document click that does NOT originate from inside .filter-dropdown.
      // The handler checks event.target.closest(".filter-dropdown"); since we fire on
      // document.body it returns null → the modal should close.
      act(() => {
        fireEvent.click(document.body);
      });

      expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // handleApplyFilters
  // -------------------------------------------------------------------------

  describe("handleApplyFilters", () => {
    it("applies full filters, resets page, and closes modal", () => {
      setupMocks();
      render(<WorkEvaluations />);

      // Open modal
      fireEvent.click(screen.getByText("filters.filterSearch"));
      // Apply filters (with workType, labels, period, pagination, order)
      fireEvent.click(screen.getByTestId("apply-filters-btn"));

      expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
      expect(mapPaginationValues).toHaveBeenCalledWith("10", mockSetCurrentSize);
      // Modal should be closed
      expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
    });

    it("handles empty filters object without crashing", () => {
      setupMocks();
      render(<WorkEvaluations />);

      fireEvent.click(screen.getByText("filters.filterSearch"));
      fireEvent.click(screen.getByTestId("apply-empty-filters-btn"));

      expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
      expect(screen.queryByTestId("filter-modal")).not.toBeInTheDocument();
    });

    it("ignores workType when all values are false", () => {
      setupMocks();
      render(<WorkEvaluations />);

      fireEvent.click(screen.getByText("filters.filterSearch"));
      fireEvent.click(screen.getByTestId("apply-worktype-false-btn"));

      // No workTypes should be set (no ARTICLE or THESIS in backend filters)
      expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
    });
  });

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  describe("search input", () => {
    it("updates search term and resets page when user types something new", () => {
      setupMocks({ search: "" });
      render(<WorkEvaluations />);

      fireEvent.change(screen.getByTestId("search-input"), {
        target: { value: "React" },
      });

      expect(mockSetSearch).toHaveBeenCalledWith("React");
      expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
    });

    it("does NOT reset the page when the search value is the same as current", () => {
      // search atom already returns "React"; typing the same value should not
      // trigger a page reset.
      setupMocks({ search: "React" });
      render(<WorkEvaluations />);

      fireEvent.change(screen.getByTestId("search-input"), {
        target: { value: "React" },
      });

      expect(mockSetSearch).toHaveBeenCalledWith("React");
      expect(mockSetCurrentPage).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Effect cleanup
  // -------------------------------------------------------------------------

  describe("useEffect cleanup", () => {
    it("removes the document click listener on unmount", () => {
      const addSpy = jest.spyOn(document, "addEventListener");
      const removeSpy = jest.spyOn(document, "removeEventListener");

      setupMocks();
      const { unmount } = render(<WorkEvaluations />);
      unmount();

      expect(addSpy).toHaveBeenCalledWith("click", expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // useWorkEvaluations called with the applied filters
  // -------------------------------------------------------------------------

  it("calls useWorkEvaluations with the current appliedFilters (initially empty)", () => {
    setupMocks();
    render(<WorkEvaluations />);
    expect(useWorkEvaluations).toHaveBeenCalledWith({});
  });
});
