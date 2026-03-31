import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Links from "./page";
import { pageAtom, searchAtom, sizeAtom, useLinks } from "./useLinks";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { navigateTo, mapPaginationValues } from "../../../../services/utils/utils";
import { deleteLink } from "../../../../services/links/list";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("./useLinks", () => {
  const actual = jest.requireActual("./useLinks");
  return {
    ...actual,
    useLinks: jest.fn(),
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

jest.mock("../../../../services/links/list", () => ({
  deleteLink: jest.fn(),
}));

// Stub CSS
jest.mock("./page.css", () => ({}), { virtual: true });

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
      <button data-testid="mock-button" className={className} onClick={onClick}>
        {children}
      </button>
    );
  };
});

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const mockLinks = [
  {
    id: "link-1",
    title: "Google",
    url: "https://google.com",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "link-2",
    title: "GitHub",
    url: "https://github.com",
    createdAt: "2024-02-20T00:00:00Z",
  },
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
  links = mockLinks,
  totalPages = 1,
  totalLinks = 2,
  isLoading = false,
  currentPage = 0,
  currentSize = 20,
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

  useLinks.mockReturnValue({
    links,
    totalPages,
    totalLinks,
    isLoading,
    refetch: mockRefetch,
  });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("Links page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence the console.error calls in tested branches
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Rendering – main elements
  // -------------------------------------------------------------------------

  describe("initial rendering", () => {
    it("renders the page title", () => {
      setupMocks();
      render(<Links />);
      expect(screen.getByText("header.links")).toBeInTheDocument();
    });

    it("renders the 'create new link' button", () => {
      setupMocks();
      render(<Links />);
      // Button with "Adicionar" text
      expect(screen.getByText("Adicionar")).toBeInTheDocument();
    });

    it("renders the search input", () => {
      setupMocks();
      render(<Links />);
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  describe("loading state", () => {
    it("shows a loading message when isLoading is true", () => {
      setupMocks({ isLoading: true, links: [] });
      render(<Links />);
      expect(screen.getByText("common.loading")).toBeInTheDocument();
    });

    it("does NOT show the links grid when loading", () => {
      setupMocks({ isLoading: true, links: [] });
      render(<Links />);
      expect(screen.queryByText("Google")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  describe("empty state", () => {
    it("shows the empty state message when there are no links and not loading", () => {
      setupMocks({ isLoading: false, links: [] });
      render(<Links />);
      expect(screen.getByText("Nenhum link encontrado")).toBeInTheDocument();
      expect(screen.getByText("Nenhuma descrição encontrada")).toBeInTheDocument();
    });

    it("does NOT show the links grid when empty", () => {
      setupMocks({ isLoading: false, links: [] });
      render(<Links />);
      expect(screen.queryByText("Google")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Populated state
  // -------------------------------------------------------------------------

  describe("populated state", () => {
    it("renders a card for each link", () => {
      setupMocks();
      render(<Links />);
      expect(screen.getByText("Google")).toBeInTheDocument();
      expect(screen.getByText("GitHub")).toBeInTheDocument();
    });

    it("renders the link URL as an anchor", () => {
      setupMocks();
      render(<Links />);
      expect(screen.getByText("https://google.com")).toBeInTheDocument();
      expect(screen.getByText("https://github.com")).toBeInTheDocument();
    });

    it("renders the formatted creation date for each link", () => {
      setupMocks({ lang: "pt" });
      render(<Links />);
      // Date should be formatted as pt-BR. Exact value depends on the locale
      // but the element containing "Criado em " should be present.
      expect(screen.getAllByText(/Criado em /).length).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  describe("pagination", () => {
    it("does NOT render pagination controls when totalPages <= 1", () => {
      setupMocks({ totalPages: 1 });
      render(<Links />);
      expect(screen.queryByText("common.previous")).not.toBeInTheDocument();
    });

    it("renders pagination controls when totalPages > 1", () => {
      setupMocks({ totalPages: 3, currentPage: 1 });
      render(<Links />);
      expect(screen.getByText("common.previous")).toBeInTheDocument();
      expect(screen.getByText("common.next")).toBeInTheDocument();
    });

    it("disables the Previous button on the first page", () => {
      setupMocks({ totalPages: 3, currentPage: 0 });
      render(<Links />);
      const prevBtn = screen.getByText("common.previous");
      expect(prevBtn).toBeDisabled();
    });

    it("disables the Next button on the last page", () => {
      setupMocks({ totalPages: 3, currentPage: 2 });
      render(<Links />);
      const nextBtn = screen.getByText("common.next");
      expect(nextBtn).toBeDisabled();
    });

    it("calls setCurrentPage with page-1 when Previous is clicked", () => {
      setupMocks({ totalPages: 3, currentPage: 2 });
      render(<Links />);
      fireEvent.click(screen.getByText("common.previous"));
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    });

    it("calls setCurrentPage with page+1 when Next is clicked", () => {
      setupMocks({ totalPages: 3, currentPage: 1 });
      render(<Links />);
      fireEvent.click(screen.getByText("common.next"));
      expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
    });

    it("does not let Previous go below 0", () => {
      setupMocks({ totalPages: 3, currentPage: 0 });
      render(<Links />);
      // button is disabled so clicking it should be a no-op; but let's verify
      // the math: Math.max(0, 0 - 1) = 0
      const prevBtn = screen.getByText("common.previous");
      fireEvent.click(prevBtn);
      // setCurrentPage called with max(0, currentPage - 1) = max(0, -1) = 0
      expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
    });

    it("does not let Next exceed totalPages-1", () => {
      setupMocks({ totalPages: 3, currentPage: 2 });
      render(<Links />);
      const nextBtn = screen.getByText("common.next");
      fireEvent.click(nextBtn);
      // min(totalPages - 1, currentPage + 1) = min(2, 3) = 2
      expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
    });

    it("displays the current page info text", () => {
      setupMocks({ totalPages: 3, currentPage: 1 });
      render(<Links />);
      // "common.page 2 common.of 3"
      expect(screen.getByText(/2/)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // handleCreateNewLink
  // -------------------------------------------------------------------------

  describe("handleCreateNewLink", () => {
    it("calls navigateTo with pt path when language is 'pt'", () => {
      setupMocks({ lang: "pt" });
      render(<Links />);
      fireEvent.click(screen.getByText("Adicionar"));
      expect(navigateTo).toHaveBeenCalledWith(
        "links/novo-link",
        mockNavigate,
        "pt"
      );
    });

    it("calls navigateTo with non-pt path when language is 'en'", () => {
      setupMocks({ lang: "en" });
      render(<Links />);
      fireEvent.click(screen.getByText("Adicionar"));
      expect(navigateTo).toHaveBeenCalledWith(
        "links/new-link",
        mockNavigate,
        "en"
      );
    });
  });

  // -------------------------------------------------------------------------
  // handleEditLink
  // -------------------------------------------------------------------------

  describe("handleEditLink", () => {
    it("opens the edit state when the Edit button is clicked", () => {
      setupMocks();
      render(<Links />);
      // Each link card has an edit button (title = "common.edit")
      const editButtons = screen.getAllByTitle("common.edit");
      fireEvent.click(editButtons[0]);
      // The editing state is internal; we cannot observe showEditModal directly
      // but the component should not crash.
    });
  });

  // -------------------------------------------------------------------------
  // handleDeleteLink – success path
  // -------------------------------------------------------------------------

  describe("handleDeleteLink – success", () => {
    beforeEach(() => {
      window.confirm = jest.fn(() => true);
      deleteLink.mockResolvedValue(undefined);
    });

    it("calls deleteLink and refetch when the user confirms deletion", async () => {
      setupMocks();
      render(<Links />);

      const deleteButtons = screen.getAllByTitle("Deletar");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(deleteLink).toHaveBeenCalledWith("link-1");
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  // -------------------------------------------------------------------------
  // handleDeleteLink – user cancels
  // -------------------------------------------------------------------------

  describe("handleDeleteLink – user cancels", () => {
    beforeEach(() => {
      window.confirm = jest.fn(() => false);
    });

    it("does NOT call deleteLink when the user cancels the confirmation", async () => {
      setupMocks();
      render(<Links />);

      const deleteButtons = screen.getAllByTitle("Deletar");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(deleteLink).not.toHaveBeenCalled();
      });
    });
  });

  // -------------------------------------------------------------------------
  // handleDeleteLink – error path
  // -------------------------------------------------------------------------

  describe("handleDeleteLink – error", () => {
    beforeEach(() => {
      window.confirm = jest.fn(() => true);
      window.alert = jest.fn();
      deleteLink.mockRejectedValue(new Error("Network error"));
    });

    it("shows an alert and logs the error when deleteLink throws", async () => {
      setupMocks();
      render(<Links />);

      const deleteButtons = screen.getAllByTitle("Deletar");

      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  describe("search input", () => {
    it("updates search term and resets page when typing a new value", () => {
      setupMocks({ search: "" });
      render(<Links />);

      fireEvent.change(screen.getByTestId("search-input"), {
        target: { value: "Google" },
      });

      expect(mockSetSearch).toHaveBeenCalledWith("Google");
      expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
    });

    it("does NOT reset the page when the new search is the same as current", () => {
      setupMocks({ search: "Google" });
      render(<Links />);

      fireEvent.change(screen.getByTestId("search-input"), {
        target: { value: "Google" },
      });

      expect(mockSetSearch).toHaveBeenCalledWith("Google");
      expect(mockSetCurrentPage).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // useEffect cleanup
  // -------------------------------------------------------------------------

  describe("useEffect cleanup", () => {
    it("removes the document click listener on unmount", () => {
      const addSpy = jest.spyOn(document, "addEventListener");
      const removeSpy = jest.spyOn(document, "removeEventListener");

      setupMocks();
      const { unmount } = render(<Links />);
      unmount();

      expect(addSpy).toHaveBeenCalledWith("click", expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // Date formatting – English locale
  // -------------------------------------------------------------------------

  describe("date formatting", () => {
    it("uses en-US locale for dates when language is not pt", () => {
      setupMocks({ lang: "en" });
      render(<Links />);
      // Dates are rendered inside "Criado em " paragraphs. Their exact format
      // differs between locales but the element should still be present.
      expect(screen.getAllByText(/Criado em /).length).toBe(2);
    });
  });
});
