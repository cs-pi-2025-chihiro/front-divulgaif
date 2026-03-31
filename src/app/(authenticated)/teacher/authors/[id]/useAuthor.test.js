/**
 * @jest-environment jsdom
 *
 * Tests for useAuthors hook exported from useAuthor.js
 * (src/app/(authenticated)/teacher/authors/[id]/useAuthor.js)
 *
 * The hook uses listAuthors, updateAuthorById, and deleteAuthorById from
 * "../../../services/authors/authorService" (relative to the hook file).
 * From this test file's location ([id]/), that resolves to:
 *   src/services/authors/authorService
 */

jest.mock("../../../services/authors/authorService", () => ({
  listAuthors: jest.fn(),
  updateAuthorById: jest.fn(),
  deleteAuthorById: jest.fn(),
}));

import { renderHook, act } from "@testing-library/react";
import { useAuthors } from "./useAuthor";
import {
  listAuthors,
  updateAuthorById,
  deleteAuthorById,
} from "../../../services/authors/authorService";

describe("useAuthors (from useAuthor.js)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    test("starts with searchTerm = empty string", () => {
      const { result } = renderHook(() => useAuthors());
      expect(result.current.searchTerm).toBe("");
    });

    test("exposes setCurrentPage as a function", () => {
      const { result } = renderHook(() => useAuthors());
      expect(typeof result.current.setCurrentPage).toBe("function");
    });

    test("exposes setSearchTerm as a function", () => {
      const { result } = renderHook(() => useAuthors());
      expect(typeof result.current.setSearchTerm).toBe("function");
    });
  });

  // ─── fetchAuthors ─────────────────────────────────────────────────────────

  describe("fetchAuthors", () => {
    test("calls listAuthors with page and size params when searchTerm is empty", async () => {
      listAuthors.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(listAuthors).toHaveBeenCalledWith({ page: 0, size: 8 });
    });

    test("includes name param when searchTerm is set", async () => {
      listAuthors.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
      });

      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setSearchTerm("Alice");
      });

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(listAuthors).toHaveBeenCalledWith({
        page: 0,
        size: 8,
        name: "Alice",
      });
    });

    test("does not include name param when searchTerm is empty string", async () => {
      listAuthors.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      const calledWith = listAuthors.mock.calls[0][0];
      expect(calledWith).not.toHaveProperty("name");
    });

    test("uses currentPage in params", async () => {
      listAuthors.mockResolvedValue({
        content: [],
        totalPages: 3,
        totalElements: 20,
      });

      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setCurrentPage(2);
      });

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(listAuthors).toHaveBeenCalledWith({ page: 2, size: 8 });
    });

    test("sets authors from response.content on success", async () => {
      const mockContent = [{ id: 1, name: "Author A" }];
      listAuthors.mockResolvedValue({
        content: mockContent,
        totalPages: 1,
        totalElements: 1,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(result.current.authors).toEqual(mockContent);
    });

    test("sets totalPages and totalElements on success", async () => {
      listAuthors.mockResolvedValue({
        content: [],
        totalPages: 5,
        totalElements: 47,
      });

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.fetchAuthors();
      });

      expect(result.current.totalPages).toBe(5);
      expect(result.current.totalElements).toBe(47);
    });

    test("isLoading is false after successful fetch", async () => {
      listAuthors.mockResolvedValue({
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
      listAuthors.mockRejectedValue(err);

      const { result } = renderHook(() => useAuthors());

      await expect(
        act(async () => {
          await result.current.fetchAuthors();
        })
      ).rejects.toThrow("Fetch failed");

      expect(result.current.error).toBe("Fetch failed");
    });

    test("isLoading is false after failed fetch (finally block)", async () => {
      listAuthors.mockRejectedValue(new Error("oops"));

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
      const responseData = { id: 1, name: "Updated" };
      updateAuthorById.mockResolvedValue(responseData);

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
        await result.current.deleteAuthor(3);
      });

      expect(deleteAuthorById).toHaveBeenCalledWith(3);
    });

    test("isLoading is false after successful delete", async () => {
      deleteAuthorById.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.deleteAuthor(3);
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("sets error and re-throws on failure", async () => {
      const err = new Error("Delete failed");
      deleteAuthorById.mockRejectedValue(err);

      const { result } = renderHook(() => useAuthors());

      await expect(
        act(async () => {
          await result.current.deleteAuthor(3);
        })
      ).rejects.toThrow("Delete failed");

      expect(result.current.error).toBe("Delete failed");
    });

    test("isLoading is false after failed delete (finally block)", async () => {
      deleteAuthorById.mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() => useAuthors());

      await act(async () => {
        await result.current.deleteAuthor(3).catch(() => {});
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

    test("setSearchTerm updates searchTerm", () => {
      const { result } = renderHook(() => useAuthors());

      act(() => {
        result.current.setSearchTerm("Bob");
      });

      expect(result.current.searchTerm).toBe("Bob");
    });
  });
});
