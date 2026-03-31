/**
 * @jest-environment jsdom
 *
 * Tests for useAuthors hook and exported constants from
 * src/app/(authenticated)/teacher/dashboard/authors/useAuthors.js
 *
 * The hook imports from "../../../../../services/authors/authorService"
 * (relative to the hook file), which resolves to src/services/authors/authorService.
 */

jest.mock("../../../../../services/authors/authorService", () => ({
  getAuthors: jest.fn(),
  updateAuthorById: jest.fn(),
  deleteAuthorById: jest.fn(),
}));

import { renderHook, act } from "@testing-library/react";
import {
  useAuthors,
  AUTHORS_PAGE_SIZE_OPTIONS,
  DEFAULT_AUTHORS_PAGE_SIZE,
} from "./useAuthors";
import {
  getAuthors,
  updateAuthorById,
  deleteAuthorById,
} from "../../../../../services/authors/authorService";

describe("useAuthors (dashboard)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── exported constants ───────────────────────────────────────────────────

  describe("exported constants", () => {
    test("AUTHORS_PAGE_SIZE_OPTIONS equals [10, 20, 50]", () => {
      expect(AUTHORS_PAGE_SIZE_OPTIONS).toEqual([10, 20, 50]);
    });

    test("DEFAULT_AUTHORS_PAGE_SIZE equals 10", () => {
      expect(DEFAULT_AUTHORS_PAGE_SIZE).toBe(10);
    });
  });

  // ─── initial state ────────────────────────────────────────────────────────

  describe("initial state", () => {
    test("starts with empty authors array", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.authors).toEqual([]);
    });

    test("starts with isLoading = false", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.isLoading).toBe(false);
    });

    test("starts with error = null", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.error).toBeNull();
    });

    test("starts with totalPages = 0", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.totalPages).toBe(0);
    });

    test("starts with totalElements = 0", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.totalElements).toBe(0);
    });

    test("starts with currentPage = 0", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.currentPage).toBe(0);
    });

    test("starts with pageSize = DEFAULT_AUTHORS_PAGE_SIZE (10)", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.pageSize).toBe(DEFAULT_AUTHORS_PAGE_SIZE);
    });

    test("starts with searchTerm = empty string", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.searchTerm).toBe("");
    });

    test("exposes setCurrentPage as a function", () => {
      const { result } = renderHook(() => useAuthors());
      expect(typeof result.current.setCurrentPage).toBe("function");
    });

    test("exposes setPageSize as a function", () => {
      const { result } = renderHook(() => useAuthors());
      expect(typeof result.current.setPageSize).toBe("function");
    });

    test("exposes setSearchTerm as a function", () => {
      const { result } = renderHook(() => useAuthors());
      expect(typeof result.current.setSearchTerm).toBe("function");
    });
  });

  // ─── fetchAuthors ─────────────────────────────────────────────────────────

  describe("fetchAuthors", () => {
    test("calls getAuthors with page and pageSize when searchTerm is empty", async () => {
      getAuthors.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(getAuthors).toHaveBeenCalledWith({ page: 0, size: 10 });
    });

    test("includes name param when searchTerm is set", async () => {
      getAuthors.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
      });

      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setSearchTerm("Carlos");
      });

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(getAuthors).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        name: "Carlos",
      });
    });

    test("does not include name param when searchTerm is empty string", async () => {
      getAuthors.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      const calledWith = getAuthors.mock.calls[0][0];
      expect(calledWith).not.toHaveProperty("name");
    });

    test("uses currentPage in params", async () => {
      getAuthors.mockResolvedValue({
        content: [],
        totalPages: 5,
        totalElements: 50,
      });

      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setCurrentPage(3);
      });

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(getAuthors).toHaveBeenCalledWith({ page: 3, size: 10 });
    });

    test("uses pageSize in params when pageSize is changed", async () => {
      getAuthors.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
      });

      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setPageSize(20);
      });

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(getAuthors).toHaveBeenCalledWith({ page: 0, size: 20 });
    });

    test("sets authors from response.content on success", async () => {
      const mockContent = [{ id: 1, name: "Author A" }, { id: 2, name: "Author B" }];
      getAuthors.mockResolvedValue({
        content: mockContent,
        totalPages: 1,
        totalElements: 2,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(result.current.authors).toEqual(mockContent);
    });

    test("sets totalPages and totalElements on success", async () => {
      getAuthors.mockResolvedValue({
        content: [],
        totalPages: 7,
        totalElements: 65,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(result.current.totalPages).toBe(7);
      expect(result.current.totalElements).toBe(65);
    });

    test("isLoading is false after successful fetch", async () => {
      getAuthors.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("sets error and re-throws on failure", async () => {
      const err = new Error("Fetch failed");
      getAuthors.mockRejectedValue(err);

      const { result } = renderHook(() => useAuthors());

      await expect(
        act(async () => {
          await result.current.fetchAuthors();
        })
      ).rejects.toThrow("Fetch failed");

      expect(result.current.error).toBe("Fetch failed");
    });

    test("isLoading is false after failed fetch (finally block)", async () => {
      getAuthors.mockRejectedValue(new Error("oops"));

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors().catch(() => {});
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  // ─── updateAuthor ─────────────────────────────────────────────────────────

  describe("updateAuthor", () => {
    test("calls updateAuthorById with authorId and authorData", async () => {
      updateAuthorById.mockResolvedValue({ id: 1, name: "Updated" });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.updateAuthor(1, { name: "Updated" });
      });

      expect(updateAuthorById).toHaveBeenCalledWith(1, { name: "Updated" });
    });

    test("returns the response from updateAuthorById", async () => {
      const responseData = { id: 5, name: "Author Five" };
      updateAuthorById.mockResolvedValue(responseData);

      const { result } = renderHook(() => useAuthors());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.updateAuthor(5, { name: "Author Five" });
      });

      expect(returnValue).toEqual(responseData);
    });

    test("isLoading is false after successful update", async () => {
      updateAuthorById.mockResolvedValue({});

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.updateAuthor(1, {});
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("sets error and re-throws on failure", async () => {
      const err = new Error("Update failed");
      updateAuthorById.mockRejectedValue(err);

      const { result } = renderHook(() => useAuthors());

      await expect(
        act(async () => {
          await result.current.updateAuthor(1, {});
        })
      ).rejects.toThrow("Update failed");

      expect(result.current.error).toBe("Update failed");
    });

    test("isLoading is false after failed update (finally block)", async () => {
      updateAuthorById.mockRejectedValue(new Error("fail"));

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.updateAuthor(1, {}).catch(() => {});
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  // ─── deleteAuthor ─────────────────────────────────────────────────────────

  describe("deleteAuthor", () => {
    test("calls deleteAuthorById with the given authorId", async () => {
      deleteAuthorById.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.deleteAuthor(7);
      });

      expect(deleteAuthorById).toHaveBeenCalledWith(7);
    });

    test("isLoading is false after successful delete", async () => {
      deleteAuthorById.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.deleteAuthor(7);
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("sets error and re-throws on failure", async () => {
      const err = new Error("Delete failed");
      deleteAuthorById.mockRejectedValue(err);

      const { result } = renderHook(() => useAuthors());

      await expect(
        act(async () => {
          await result.current.deleteAuthor(7);
        })
      ).rejects.toThrow("Delete failed");

      expect(result.current.error).toBe("Delete failed");
    });

    test("isLoading is false after failed delete (finally block)", async () => {
      deleteAuthorById.mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.deleteAuthor(7).catch(() => {});
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  // ─── state setters ────────────────────────────────────────────────────────

  describe("state setters", () => {
    test("setCurrentPage updates currentPage", () => {
      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setCurrentPage(4);
      });

      expect(result.current.currentPage).toBe(4);
    });

    test("setPageSize updates pageSize", () => {
      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setPageSize(50);
      });

      expect(result.current.pageSize).toBe(50);
    });

    test("setSearchTerm updates searchTerm", () => {
      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setSearchTerm("Diana");
      });

      expect(result.current.searchTerm).toBe("Diana");
    });
  });
});
