/**
 * @jest-environment jsdom
 */

jest.mock("../api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from "../api";
import {
  listAuthors,
  getAuthorById,
  createAuthor,
  updateAuthorById,
  deleteAuthorById,
} from "./AuthorService";

describe("AuthorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // ─── listAuthors ──────────────────────────────────────────────────────────

  describe("listAuthors", () => {
    test("calls api.get with /authors/list endpoint when no params", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get.mock.calls[0][0]).toMatch(/^\/authors\/list\?/);
    });

    test("returns response.data on success", async () => {
      const mockData = [{ id: 1, name: "Author One" }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await listAuthors();

      expect(result).toEqual(mockData);
    });

    test("works with empty params object (default)", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors({});

      expect(api.get).toHaveBeenCalledTimes(1);
    });

    test("appends valid string and numeric params to query string", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors({ name: "Alice", page: 0, size: 8 });

      const url = api.get.mock.calls[0][0];
      expect(url).toContain("name=Alice");
      expect(url).toContain("page=0");
      expect(url).toContain("size=8");
    });

    test("omits undefined params from query string", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors({ name: undefined, size: 5 });

      const url = api.get.mock.calls[0][0];
      expect(url).not.toContain("name=");
      expect(url).toContain("size=5");
    });

    test("omits null params from query string", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors({ name: null, size: 5 });

      const url = api.get.mock.calls[0][0];
      expect(url).not.toContain("name=");
    });

    test("omits empty string params from query string", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors({ name: "", size: 5 });

      const url = api.get.mock.calls[0][0];
      expect(url).not.toContain("name=");
    });

    test("logs error and re-throws when api.get rejects", async () => {
      const err = new Error("Network error");
      api.get.mockRejectedValue(err);

      await expect(listAuthors()).rejects.toThrow("Network error");
      expect(console.error).toHaveBeenCalledWith(
        "Error listing authors:",
        err
      );
    });
  });

  // ─── getAuthorById ────────────────────────────────────────────────────────

  describe("getAuthorById", () => {
    test("calls api.get with /authors/:id", async () => {
      api.get.mockResolvedValue({ data: { id: 1, name: "Test" } });

      await getAuthorById(1);

      expect(api.get).toHaveBeenCalledWith("/authors/1");
    });

    test("returns response.data on success", async () => {
      const mockData = { id: 42, name: "Author 42" };
      api.get.mockResolvedValue({ data: mockData });

      const result = await getAuthorById(42);

      expect(result).toEqual(mockData);
    });

    test("works with different author IDs", async () => {
      api.get.mockResolvedValue({ data: { id: 99 } });

      await getAuthorById(99);

      expect(api.get).toHaveBeenCalledWith("/authors/99");
    });

    test("logs error and re-throws when api.get rejects", async () => {
      const err = new Error("Not found");
      api.get.mockRejectedValue(err);

      await expect(getAuthorById(1)).rejects.toThrow("Not found");
      expect(console.error).toHaveBeenCalledWith("Error getting author:", err);
    });
  });

  // ─── createAuthor ─────────────────────────────────────────────────────────

  describe("createAuthor", () => {
    test("calls api.post with /authors and the provided data", async () => {
      const authorData = { name: "New Author", email: "new@example.com" };
      api.post.mockResolvedValue({ data: { id: 10, ...authorData } });

      await createAuthor(authorData);

      expect(api.post).toHaveBeenCalledWith("/authors", authorData);
    });

    test("returns response.data on success", async () => {
      const authorData = { name: "New Author" };
      const responseData = { id: 10, name: "New Author" };
      api.post.mockResolvedValue({ data: responseData });

      const result = await createAuthor(authorData);

      expect(result).toEqual(responseData);
    });

    test("logs error and re-throws when api.post rejects", async () => {
      const err = new Error("Create failed");
      api.post.mockRejectedValue(err);

      await expect(createAuthor({ name: "X" })).rejects.toThrow("Create failed");
      expect(console.error).toHaveBeenCalledWith(
        "Error creating author:",
        err
      );
    });
  });

  // ─── updateAuthorById ─────────────────────────────────────────────────────

  describe("updateAuthorById", () => {
    test("calls api.put with /authors/:id and the provided data", async () => {
      const authorData = { name: "Updated" };
      api.put.mockResolvedValue({ data: { id: 1, ...authorData } });

      await updateAuthorById(1, authorData);

      expect(api.put).toHaveBeenCalledWith("/authors/1", authorData);
    });

    test("returns response.data on success", async () => {
      const responseData = { id: 1, name: "Updated" };
      api.put.mockResolvedValue({ data: responseData });

      const result = await updateAuthorById(1, { name: "Updated" });

      expect(result).toEqual(responseData);
    });

    test("uses the correct ID in the URL for different IDs", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateAuthorById(77, { name: "Test" });

      expect(api.put).toHaveBeenCalledWith("/authors/77", { name: "Test" });
    });

    test("throws specific message for 409 Conflict", async () => {
      const err = new Error("Conflict");
      err.response = { status: 409 };
      api.put.mockRejectedValue(err);

      await expect(updateAuthorById(1, {})).rejects.toThrow(
        "Este email já está sendo usado por outro autor"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error updating author:",
        err
      );
    });

    test("throws specific message for 404 Not Found", async () => {
      const err = new Error("Not Found");
      err.response = { status: 404 };
      api.put.mockRejectedValue(err);

      await expect(updateAuthorById(99, {})).rejects.toThrow(
        "Autor não encontrado"
      );
    });

    test("re-throws original error for other HTTP status codes", async () => {
      const err = new Error("Server Error");
      err.response = { status: 500 };
      api.put.mockRejectedValue(err);

      await expect(updateAuthorById(1, {})).rejects.toThrow("Server Error");
    });

    test("re-throws network errors that have no response property", async () => {
      const err = new Error("Network failure");
      api.put.mockRejectedValue(err);

      await expect(updateAuthorById(1, {})).rejects.toThrow("Network failure");
    });
  });

  // ─── deleteAuthorById ─────────────────────────────────────────────────────

  describe("deleteAuthorById", () => {
    test("calls api.delete with /authors/:id", async () => {
      api.delete.mockResolvedValue({});

      await deleteAuthorById(1);

      expect(api.delete).toHaveBeenCalledWith("/authors/1");
    });

    test("returns undefined on success (no return value)", async () => {
      api.delete.mockResolvedValue({});

      const result = await deleteAuthorById(1);

      expect(result).toBeUndefined();
    });

    test("uses the correct ID in the URL for different IDs", async () => {
      api.delete.mockResolvedValue({});

      await deleteAuthorById(55);

      expect(api.delete).toHaveBeenCalledWith("/authors/55");
    });

    test("throws specific message for 404 Not Found", async () => {
      const err = new Error("Not Found");
      err.response = { status: 404 };
      api.delete.mockRejectedValue(err);

      await expect(deleteAuthorById(99)).rejects.toThrow(
        "Autor não encontrado"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting author:",
        err
      );
    });

    test("re-throws original error for other HTTP status codes", async () => {
      const err = new Error("Server Error");
      err.response = { status: 500 };
      api.delete.mockRejectedValue(err);

      await expect(deleteAuthorById(1)).rejects.toThrow("Server Error");
    });

    test("re-throws network errors that have no response property", async () => {
      const err = new Error("Connection refused");
      api.delete.mockRejectedValue(err);

      await expect(deleteAuthorById(1)).rejects.toThrow("Connection refused");
    });
  });
});
