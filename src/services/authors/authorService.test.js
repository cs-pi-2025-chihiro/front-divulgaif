import {
  getAuthors,
  listAuthors,
  updateAuthorById,
  deleteAuthorById,
} from "./authorService";

jest.mock("../utils/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from "../utils/api";

describe("authorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAuthors", () => {
    test("calls api.get with /authors endpoint", async () => {
      api.get.mockResolvedValue({ data: [] });

      await getAuthors();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get.mock.calls[0][0]).toMatch(/^\/authors\?/);
    });

    test("returns response.data", async () => {
      const mockData = [{ id: 1, name: "Author One" }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await getAuthors();

      expect(result).toEqual(mockData);
    });

    test("includes valid query params in the URL", async () => {
      api.get.mockResolvedValue({ data: [] });

      await getAuthors({ name: "Alice", page: 0 });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("name=Alice");
      expect(calledUrl).toContain("page=0");
    });

    test("omits undefined and null values from query params", async () => {
      api.get.mockResolvedValue({ data: [] });

      await getAuthors({ name: undefined, page: null, size: 10 });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).not.toContain("name=");
      expect(calledUrl).not.toContain("page=");
      expect(calledUrl).toContain("size=10");
    });

    test("omits empty string values from query params", async () => {
      api.get.mockResolvedValue({ data: [] });

      await getAuthors({ name: "", size: 5 });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).not.toContain("name=");
      expect(calledUrl).toContain("size=5");
    });

    test("works with empty params object", async () => {
      api.get.mockResolvedValue({ data: [] });

      await getAuthors({});

      expect(api.get).toHaveBeenCalledTimes(1);
    });

    test("throws error when api.get fails", async () => {
      const error = new Error("API error");
      api.get.mockRejectedValue(error);

      await expect(getAuthors()).rejects.toThrow("API error");
    });
  });

  describe("listAuthors", () => {
    test("calls api.get with /authors/list endpoint", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get.mock.calls[0][0]).toMatch(/^\/authors\/list\?/);
    });

    test("returns response.data", async () => {
      const mockData = [{ id: 2, name: "Author Two" }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await listAuthors();

      expect(result).toEqual(mockData);
    });

    test("includes valid query params in the URL", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors({ search: "Bob" });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("search=Bob");
    });

    test("omits undefined and null params", async () => {
      api.get.mockResolvedValue({ data: [] });

      await listAuthors({ search: undefined, page: null });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).not.toContain("search=");
      expect(calledUrl).not.toContain("page=");
    });

    test("throws error when api.get fails", async () => {
      const error = new Error("List error");
      api.get.mockRejectedValue(error);

      await expect(listAuthors()).rejects.toThrow("List error");
    });
  });

  describe("updateAuthorById", () => {
    test("calls api.put with correct URL and data", async () => {
      const authorData = { name: "Updated Name", email: "updated@example.com" };
      api.put.mockResolvedValue({ data: { id: 1, ...authorData } });

      await updateAuthorById(1, authorData);

      expect(api.put).toHaveBeenCalledWith("/authors/1", authorData);
    });

    test("returns response.data on success", async () => {
      const authorData = { name: "Updated Name" };
      const responseData = { id: 1, name: "Updated Name" };
      api.put.mockResolvedValue({ data: responseData });

      const result = await updateAuthorById(1, authorData);

      expect(result).toEqual(responseData);
    });

    test("throws specific message for 409 conflict", async () => {
      const conflictError = new Error("Conflict");
      conflictError.response = { status: 409 };
      api.put.mockRejectedValue(conflictError);

      await expect(updateAuthorById(1, {})).rejects.toThrow(
        "Este email já está sendo usado por outro autor"
      );
    });

    test("throws specific message for 404 not found", async () => {
      const notFoundError = new Error("Not Found");
      notFoundError.response = { status: 404 };
      api.put.mockRejectedValue(notFoundError);

      await expect(updateAuthorById(99, {})).rejects.toThrow(
        "Autor não encontrado"
      );
    });

    test("re-throws other errors unchanged", async () => {
      const serverError = new Error("Internal Server Error");
      serverError.response = { status: 500 };
      api.put.mockRejectedValue(serverError);

      await expect(updateAuthorById(1, {})).rejects.toThrow(
        "Internal Server Error"
      );
    });

    test("re-throws network errors without response", async () => {
      const networkError = new Error("Network failure");
      api.put.mockRejectedValue(networkError);

      await expect(updateAuthorById(1, {})).rejects.toThrow("Network failure");
    });

    test("uses correct author ID in URL for different IDs", async () => {
      api.put.mockResolvedValue({ data: {} });

      await updateAuthorById(42, { name: "Test" });

      expect(api.put).toHaveBeenCalledWith("/authors/42", { name: "Test" });
    });
  });

  describe("deleteAuthorById", () => {
    test("calls api.delete with correct URL", async () => {
      api.delete.mockResolvedValue({});

      await deleteAuthorById(1);

      expect(api.delete).toHaveBeenCalledWith("/authors/1");
    });

    test("does not return a value on success", async () => {
      api.delete.mockResolvedValue({});

      const result = await deleteAuthorById(1);

      expect(result).toBeUndefined();
    });

    test("throws specific message for 404 not found", async () => {
      const notFoundError = new Error("Not Found");
      notFoundError.response = { status: 404 };
      api.delete.mockRejectedValue(notFoundError);

      await expect(deleteAuthorById(99)).rejects.toThrow(
        "Autor não encontrado"
      );
    });

    test("re-throws other errors unchanged", async () => {
      const serverError = new Error("Server Error");
      serverError.response = { status: 500 };
      api.delete.mockRejectedValue(serverError);

      await expect(deleteAuthorById(1)).rejects.toThrow("Server Error");
    });

    test("re-throws network errors without response", async () => {
      const networkError = new Error("Connection refused");
      api.delete.mockRejectedValue(networkError);

      await expect(deleteAuthorById(1)).rejects.toThrow("Connection refused");
    });

    test("uses correct author ID in URL for different IDs", async () => {
      api.delete.mockResolvedValue({});

      await deleteAuthorById(77);

      expect(api.delete).toHaveBeenCalledWith("/authors/77");
    });
  });
});
