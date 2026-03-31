import {
  searchAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "./list";

jest.mock("../utils/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../enums/endpoints", () => ({
  ENDPOINTS: {
    AUTHORS: {
      SEARCH: "/authors/list",
      CREATE: "/authors",
    },
  },
}));

import { api } from "../utils/api";

describe("authors/list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchAuthors", () => {
    test("calls api.get and returns structured result", async () => {
      api.get.mockResolvedValue({
        data: { content: [{ id: 1 }], totalPages: 1, totalElements: 1, number: 0 },
      });

      const result = await searchAuthors("Alice");

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result.content).toEqual([{ id: 1 }]);
      expect(result.totalPages).toBe(1);
      expect(result.totalElements).toBe(1);
      expect(result.number).toBe(0);
    });

    test("appends name.like param when searchTerm is provided", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      });

      await searchAuthors("Bob");

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("name.like=Bob");
    });

    test("does not append name.like when searchTerm is empty", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      });

      await searchAuthors("");

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).not.toContain("name.like");
    });

    test("uses default page=0 and size=20", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      });

      await searchAuthors();

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("page=0");
      expect(calledUrl).toContain("size=20");
    });

    test("uses provided custom page and size", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      });

      await searchAuthors("", 2, 10);

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("size=10");
    });

    test("returns defaults when response data is missing fields", async () => {
      api.get.mockResolvedValue({ data: {} });

      const result = await searchAuthors();

      expect(result.content).toEqual([]);
      expect(result.totalPages).toBe(0);
      expect(result.totalElements).toBe(0);
      expect(result.number).toBe(0);
    });

    test("throws an error when api.get fails", async () => {
      api.get.mockRejectedValue(new Error("Network error"));

      await expect(searchAuthors("test")).rejects.toThrow(
        "Error fetching authors"
      );
    });

    test("throws error with response message when available", async () => {
      const err = new Error("Server error");
      err.response = { data: { message: "Custom server message" } };
      api.get.mockRejectedValue(err);

      await expect(searchAuthors("test")).rejects.toThrow(
        "Custom server message"
      );
    });
  });

  describe("createAuthor", () => {
    test("calls api.post with correct endpoint and data", async () => {
      const authorData = { name: "Alice", email: "alice@example.com" };
      api.post.mockResolvedValue({ data: { id: 1, ...authorData } });

      const result = await createAuthor(authorData);

      expect(api.post).toHaveBeenCalledWith("/authors", authorData);
      expect(result).toEqual({ id: 1, ...authorData });
    });

    test("throws an error when api.post fails", async () => {
      api.post.mockRejectedValue(new Error("API Error"));

      await expect(createAuthor({})).rejects.toThrow("Error creating author");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("conflict");
      err.response = { data: { message: "Author already exists" } };
      api.post.mockRejectedValue(err);

      await expect(createAuthor({})).rejects.toThrow("Author already exists");
    });
  });

  describe("updateAuthor", () => {
    test("calls api.put with correct URL and data", async () => {
      const authorData = { name: "Updated" };
      api.put.mockResolvedValue({ data: { id: 1, ...authorData } });

      const result = await updateAuthor(1, authorData);

      expect(api.put).toHaveBeenCalledWith("/authors/1", authorData);
      expect(result).toEqual({ id: 1, ...authorData });
    });

    test("throws specific message for 409 conflict", async () => {
      const err = new Error("Conflict");
      err.response = { status: 409 };
      api.put.mockRejectedValue(err);

      await expect(updateAuthor(1, {})).rejects.toThrow(
        "Este email já está sendo usado por outro autor"
      );
    });

    test("throws specific message for 404 not found", async () => {
      const err = new Error("Not Found");
      err.response = { status: 404 };
      api.put.mockRejectedValue(err);

      await expect(updateAuthor(1, {})).rejects.toThrow(
        "Autor não encontrado"
      );
    });

    test("throws generic error for other failures", async () => {
      api.put.mockRejectedValue(new Error("Network error"));

      await expect(updateAuthor(1, {})).rejects.toThrow("Error updating author");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("server");
      err.response = { status: 500, data: { message: "Server failed" } };
      api.put.mockRejectedValue(err);

      await expect(updateAuthor(1, {})).rejects.toThrow("Server failed");
    });
  });

  describe("deleteAuthor", () => {
    test("calls api.delete with correct URL", async () => {
      api.delete.mockResolvedValue({});

      await deleteAuthor(1);

      expect(api.delete).toHaveBeenCalledWith("/authors/1");
    });

    test("does not return a value on success", async () => {
      api.delete.mockResolvedValue({});

      const result = await deleteAuthor(1);

      expect(result).toBeUndefined();
    });

    test("throws specific message for 404 not found", async () => {
      const err = new Error("Not Found");
      err.response = { status: 404 };
      api.delete.mockRejectedValue(err);

      await expect(deleteAuthor(99)).rejects.toThrow("Autor não encontrado");
    });

    test("throws generic error for other failures", async () => {
      api.delete.mockRejectedValue(new Error("Network error"));

      await expect(deleteAuthor(1)).rejects.toThrow("Error deleting author");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("server");
      err.response = { status: 500, data: { message: "Delete failed" } };
      api.delete.mockRejectedValue(err);

      await expect(deleteAuthor(1)).rejects.toThrow("Delete failed");
    });
  });
});
