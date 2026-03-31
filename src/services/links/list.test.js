import { searchLinks, createLink, updateLink, deleteLink } from "./list";

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
    LINKS: {
      LIST: "/links/list",
      CREATE: "/links",
      UPDATE: "/links/{id}",
      DELETE: "/links/{id}",
    },
  },
}));

import { api } from "../utils/api";

describe("links/list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchLinks", () => {
    test("calls api.get and returns structured result", async () => {
      api.get.mockResolvedValue({
        data: { content: [{ id: 1, name: "Link" }], totalPages: 1, totalElements: 1 },
      });

      const result = await searchLinks("Link");

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result.content).toEqual([{ id: 1, name: "Link" }]);
      expect(result.totalPages).toBe(1);
      expect(result.totalElements).toBe(1);
    });

    test("appends name.like param when searchTerm is provided", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0 },
      });

      await searchLinks("Github");

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("name.like=Github");
    });

    test("does not append name.like when searchTerm is empty", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0 },
      });

      await searchLinks();

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).not.toContain("name.like");
    });

    test("uses default page=0 and size=20", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0 },
      });

      await searchLinks();

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("page=0");
      expect(calledUrl).toContain("size=20");
    });

    test("returns defaults when response data is missing fields", async () => {
      api.get.mockResolvedValue({ data: {} });

      const result = await searchLinks();

      expect(result.content).toEqual([]);
      expect(result.totalPages).toBe(0);
      expect(result.totalElements).toBe(0);
    });

    test("throws error when api.get fails", async () => {
      api.get.mockRejectedValue(new Error("Network error"));

      await expect(searchLinks("test")).rejects.toThrow("Error fetching links");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("server");
      err.response = { data: { message: "Custom link error" } };
      api.get.mockRejectedValue(err);

      await expect(searchLinks()).rejects.toThrow("Custom link error");
    });
  });

  describe("createLink", () => {
    test("calls api.post with correct endpoint and data", async () => {
      const linkData = { name: "GitHub", url: "https://github.com" };
      api.post.mockResolvedValue({ data: { id: 1, ...linkData } });

      const result = await createLink(linkData);

      expect(api.post).toHaveBeenCalledWith("/links", linkData);
      expect(result).toEqual({ id: 1, ...linkData });
    });

    test("throws error when api.post fails", async () => {
      api.post.mockRejectedValue(new Error("API Error"));

      await expect(createLink({})).rejects.toThrow("Error creating link");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("conflict");
      err.response = { data: { message: "Link already exists" } };
      api.post.mockRejectedValue(err);

      await expect(createLink({})).rejects.toThrow("Link already exists");
    });
  });

  describe("updateLink", () => {
    test("calls api.put with correct URL and data", async () => {
      const linkData = { name: "Updated", url: "https://updated.com" };
      api.put.mockResolvedValue({ data: { id: 1, ...linkData } });

      const result = await updateLink(1, linkData);

      expect(api.put).toHaveBeenCalledWith("/links/1", linkData);
      expect(result).toEqual({ id: 1, ...linkData });
    });

    test("throws error when api.put fails", async () => {
      api.put.mockRejectedValue(new Error("Update error"));

      await expect(updateLink(1, {})).rejects.toThrow("Error updating link");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("server");
      err.response = { data: { message: "Update failed" } };
      api.put.mockRejectedValue(err);

      await expect(updateLink(1, {})).rejects.toThrow("Update failed");
    });
  });

  describe("deleteLink", () => {
    test("calls api.delete with correct URL", async () => {
      api.delete.mockResolvedValue({});

      await deleteLink(1);

      expect(api.delete).toHaveBeenCalledWith("/links/1");
    });

    test("does not return a value on success", async () => {
      api.delete.mockResolvedValue({});

      const result = await deleteLink(1);

      expect(result).toBeUndefined();
    });

    test("throws error when api.delete fails", async () => {
      api.delete.mockRejectedValue(new Error("Delete error"));

      await expect(deleteLink(1)).rejects.toThrow("Error deleting link");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("server");
      err.response = { data: { message: "Cannot delete" } };
      api.delete.mockRejectedValue(err);

      await expect(deleteLink(1)).rejects.toThrow("Cannot delete");
    });
  });
});
