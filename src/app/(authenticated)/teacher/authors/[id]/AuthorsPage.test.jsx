import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthorsPage from "./page";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (key === "authors.deleteConfirmation" && opts?.name) {
        return `Delete ${opts.name}?`;
      }
      const map = {
        "authors.title": "Authors",
        "authors.searchPlaceholder": "Search authors...",
        "authors.noAuthorsFound": "No authors found.",
        "common.loading": "Loading...",
        "common.edit": "Edit",
        "common.delete": "Delete",
        "common.cancel": "Cancel",
        "common.save": "Save",
        "authors.editAuthor": "Edit Author",
        "authors.deleteAuthor": "Delete Author",
        "authors.name": "Name",
        "authors.email": "Email",
        "authors.registered": "Registered",
        "authors.notRegistered": "Not Registered",
        "authors.authors": "authors",
        "authors.updateSuccess": "Author updated successfully",
        "authors.updateError": "Error updating author",
        "authors.deleteSuccess": "Author deleted successfully",
        "authors.deleteError": "Error deleting author",
        "pagination.showing": "Showing",
        "pagination.of": "of",
        "pagination.page": "Page",
      };
      return map[key] || key;
    },
  }),
}));

const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

jest.mock("../../../components/notification/NotificationProvider", () => ({
  useNotification: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

const mockFetchAuthors = jest.fn();
const mockUpdateAuthor = jest.fn();
const mockDeleteAuthor = jest.fn();
const mockSetCurrentPage = jest.fn();
const mockSetSearchTerm = jest.fn();

let mockAuthorsHookState = {};

jest.mock("./useAuthors", () => ({
  useAuthors: jest.fn(() => mockAuthorsHookState),
}));

// Mock sub-components for isolation
jest.mock("../../../components/button", () => {
  return function MockButton({ children, onClick, disabled, type, variant, size, ...rest }) {
    return (
      <button onClick={onClick} disabled={disabled} type={type || "button"} data-variant={variant} {...rest}>
        {children}
      </button>
    );
  };
});

jest.mock("../../../components/input", () => ({
  Input: function MockInput({ id, type, value, onChange, required, className }) {
    return (
      <input
        id={id}
        type={type || "text"}
        value={value}
        onChange={onChange}
        required={required}
        className={className}
      />
    );
  },
  SearchInput: function MockSearchInput({ value, onChange, placeholder, className }) {
    return (
      <input
        data-testid="search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    );
  },
}));

jest.mock("../../../components/modal/modal", () => {
  return function MockModal({ isOpen, onClose, title, children, width }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal" aria-label={title} data-width={width}>
        <h2>{title}</h2>
        <button data-testid="modal-overlay-close" onClick={onClose}>X</button>
        {children}
      </div>
    );
  };
});

jest.mock("./page.css", () => ({}), { virtual: true });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const { useAuthors } = require("./useAuthors");

const sampleAuthors = [
  { id: 1, name: "Alice Doe", email: "alice@test.com", userId: 10, type: "CADASTRADO" },
  { id: 2, name: "Bob Smith", email: "bob@test.com", userId: null, type: "EXTERNO" },
];

function setupHook(overrides = {}) {
  mockAuthorsHookState = {
    authors: sampleAuthors,
    isLoading: false,
    totalPages: 1,
    totalElements: 2,
    currentPage: 0,
    setCurrentPage: mockSetCurrentPage,
    searchTerm: "",
    setSearchTerm: mockSetSearchTerm,
    fetchAuthors: mockFetchAuthors,
    updateAuthor: mockUpdateAuthor,
    deleteAuthor: mockDeleteAuthor,
    ...overrides,
  };
  useAuthors.mockReturnValue(mockAuthorsHookState);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AuthorsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupHook();
    mockFetchAuthors.mockResolvedValue(undefined);
    mockUpdateAuthor.mockResolvedValue(undefined);
    mockDeleteAuthor.mockResolvedValue(undefined);
  });

  // -------------------------------------------------------------------------
  // Initial render
  // -------------------------------------------------------------------------

  test("renders page title", () => {
    render(<AuthorsPage />);
    expect(screen.getByText("Authors")).toBeInTheDocument();
  });

  test("renders search input", () => {
    render(<AuthorsPage />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  test("calls fetchAuthors on mount", () => {
    render(<AuthorsPage />);
    expect(mockFetchAuthors).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  test("displays loading state when isLoading is true", () => {
    setupHook({ isLoading: true, authors: [] });
    render(<AuthorsPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  test("displays 'no authors found' when authors list is empty", () => {
    setupHook({ authors: [] });
    render(<AuthorsPage />);
    expect(screen.getByText("No authors found.")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Populated state
  // -------------------------------------------------------------------------

  test("renders list of authors", () => {
    render(<AuthorsPage />);
    expect(screen.getByText("Alice Doe")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  test("renders author emails", () => {
    render(<AuthorsPage />);
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  test("renders 'Registered' badge for author with userId", () => {
    render(<AuthorsPage />);
    expect(screen.getByText("Registered")).toBeInTheDocument();
  });

  test("renders 'Not Registered' badge for author without userId", () => {
    render(<AuthorsPage />);
    expect(screen.getByText("Not Registered")).toBeInTheDocument();
  });

  test("renders 'Registered' badge for author with type CADASTRADO (no userId)", () => {
    setupHook({
      authors: [{ id: 3, name: "Carol", email: "carol@test.com", userId: null, type: "CADASTRADO" }],
    });
    render(<AuthorsPage />);
    expect(screen.getByText("Registered")).toBeInTheDocument();
  });

  test("renders first character of author name as avatar", () => {
    render(<AuthorsPage />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  test("renders pagination info with author counts", () => {
    render(<AuthorsPage />);
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText(/2 authors/i)).toBeInTheDocument();
  });

  test("renders pagination controls", () => {
    render(<AuthorsPage />);
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
  });

  test("previous page button is disabled on page 0", () => {
    render(<AuthorsPage />);
    const prevBtn = screen.getByText("<");
    expect(prevBtn).toBeDisabled();
  });

  test("next page button is disabled when on last page", () => {
    render(<AuthorsPage />);
    const nextBtn = screen.getByText(">");
    expect(nextBtn).toBeDisabled();
  });

  test("clicking previous page when currentPage > 0 calls setCurrentPage", () => {
    setupHook({ currentPage: 1, totalPages: 3, totalElements: 24 });
    render(<AuthorsPage />);
    const prevBtn = screen.getByText("<");
    fireEvent.click(prevBtn);
    expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
  });

  test("clicking previous page when currentPage === 0 does not call setCurrentPage", () => {
    render(<AuthorsPage />);
    const prevBtn = screen.getByText("<");
    fireEvent.click(prevBtn);
    expect(mockSetCurrentPage).not.toHaveBeenCalled();
  });

  test("clicking next page when not on last page calls setCurrentPage", () => {
    setupHook({ currentPage: 0, totalPages: 3, totalElements: 24 });
    render(<AuthorsPage />);
    const nextBtn = screen.getByText(">");
    fireEvent.click(nextBtn);
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
  });

  test("clicking next page on last page does not call setCurrentPage", () => {
    render(<AuthorsPage />);
    const nextBtn = screen.getByText(">");
    fireEvent.click(nextBtn);
    expect(mockSetCurrentPage).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  test("typing in search input calls setSearchTerm and setCurrentPage", () => {
    render(<AuthorsPage />);
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "Alice" } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith("Alice");
    expect(mockSetCurrentPage).toHaveBeenCalledWith(0);
  });

  // -------------------------------------------------------------------------
  // Edit modal
  // -------------------------------------------------------------------------

  test("clicking Edit opens edit modal for correct author", () => {
    render(<AuthorsPage />);
    const editBtns = screen.getAllByText("Edit");
    fireEvent.click(editBtns[0]);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Edit Author")).toBeInTheDocument();
  });

  test("edit modal pre-fills form with author name and email", () => {
    render(<AuthorsPage />);
    const editBtns = screen.getAllByText("Edit");
    fireEvent.click(editBtns[0]);
    expect(screen.getByDisplayValue("Alice Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice@test.com")).toBeInTheDocument();
  });

  test("edit modal can be closed via close button", () => {
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    fireEvent.click(screen.getAllByText("Cancel")[0]);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  test("editing name field updates form state", () => {
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    const nameInput = screen.getByDisplayValue("Alice Doe");
    fireEvent.change(nameInput, { target: { value: "Alice Updated" } });
    expect(nameInput.value).toBe("Alice Updated");
  });

  test("editing email field updates form state", () => {
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    const emailInput = screen.getByDisplayValue("alice@test.com");
    fireEvent.change(emailInput, { target: { value: "new@test.com" } });
    expect(emailInput.value).toBe("new@test.com");
  });

  test("submitting edit form calls updateAuthor and shows success notification", async () => {
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    const form = screen.getByRole("form") || screen.getByText("Save").closest("form");
    fireEvent.submit(form || screen.getByText("Save"));

    await waitFor(() => {
      expect(mockUpdateAuthor).toHaveBeenCalledWith(1, { name: "Alice Doe", email: "alice@test.com" });
    });
    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith("Author updated successfully");
    });
  });

  test("edit form submission shows error notification when updateAuthor throws", async () => {
    mockUpdateAuthor.mockRejectedValueOnce(new Error("Update failed"));
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    const saveBtn = screen.getByText("Save");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith("Update failed");
    });
  });

  test("edit form submission shows fallback error when error has no message", async () => {
    mockUpdateAuthor.mockRejectedValueOnce({});
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith("authors.updateError");
    });
  });

  test("modal closes and fetchAuthors is called after successful edit", async () => {
    render(<AuthorsPage />);
    const initialFetchCount = mockFetchAuthors.mock.calls.length;
    fireEvent.click(screen.getAllByText("Edit")[0]);
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockFetchAuthors.mock.calls.length).toBeGreaterThan(initialFetchCount);
    });
    expect(screen.queryByText("Edit Author")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Delete modal
  // -------------------------------------------------------------------------

  test("clicking Delete opens delete confirmation modal", () => {
    render(<AuthorsPage />);
    const deleteBtns = screen.getAllByText("Delete");
    fireEvent.click(deleteBtns[0]);
    expect(screen.getByText("Delete Author")).toBeInTheDocument();
  });

  test("delete modal shows confirmation message with author name", () => {
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(screen.getByText(/Delete Alice Doe/i)).toBeInTheDocument();
  });

  test("clicking Cancel in delete modal closes it", () => {
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(screen.getByText("Delete Author")).toBeInTheDocument();
    // The Cancel button inside the delete modal
    const cancelBtn = screen.getAllByText("Cancel");
    fireEvent.click(cancelBtn[cancelBtn.length - 1]);
    expect(screen.queryByText("Delete Author")).not.toBeInTheDocument();
  });

  test("confirming delete calls deleteAuthor and shows success notification", async () => {
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Delete")[0]);
    // Confirm delete — the last "Delete" button should be in the modal
    const deleteBtnsAfterOpen = screen.getAllByText("Delete");
    fireEvent.click(deleteBtnsAfterOpen[deleteBtnsAfterOpen.length - 1]);

    await waitFor(() => {
      expect(mockDeleteAuthor).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith("Author deleted successfully");
    });
  });

  test("delete shows error notification when deleteAuthor throws", async () => {
    mockDeleteAuthor.mockRejectedValueOnce(new Error("Delete failed"));
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Delete")[0]);
    const deleteBtnsAfterOpen = screen.getAllByText("Delete");
    fireEvent.click(deleteBtnsAfterOpen[deleteBtnsAfterOpen.length - 1]);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith("Delete failed");
    });
  });

  test("delete shows fallback error when error has no message", async () => {
    mockDeleteAuthor.mockRejectedValueOnce({});
    render(<AuthorsPage />);
    fireEvent.click(screen.getAllByText("Delete")[0]);
    const deleteBtnsAfterOpen = screen.getAllByText("Delete");
    fireEvent.click(deleteBtnsAfterOpen[deleteBtnsAfterOpen.length - 1]);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith("authors.deleteError");
    });
  });

  test("modal closes and fetchAuthors called after successful delete", async () => {
    render(<AuthorsPage />);
    const initialFetchCount = mockFetchAuthors.mock.calls.length;
    fireEvent.click(screen.getAllByText("Delete")[0]);
    const deleteBtnsAfterOpen = screen.getAllByText("Delete");
    fireEvent.click(deleteBtnsAfterOpen[deleteBtnsAfterOpen.length - 1]);

    await waitFor(() => {
      expect(mockFetchAuthors.mock.calls.length).toBeGreaterThan(initialFetchCount);
    });
    expect(screen.queryByText("Delete Author")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // useEffect re-fetch on page/search changes
  // -------------------------------------------------------------------------

  test("fetchAuthors is called when currentPage changes", () => {
    const { rerender } = render(<AuthorsPage />);
    const callsBefore = mockFetchAuthors.mock.calls.length;
    setupHook({ currentPage: 1 });
    rerender(<AuthorsPage />);
    expect(mockFetchAuthors.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  test("fetchAuthors is called when searchTerm changes", () => {
    const { rerender } = render(<AuthorsPage />);
    const callsBefore = mockFetchAuthors.mock.calls.length;
    setupHook({ searchTerm: "bob" });
    rerender(<AuthorsPage />);
    expect(mockFetchAuthors.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});
