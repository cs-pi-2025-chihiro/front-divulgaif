import { searchLabels, createLabel, updateLabel, deleteLabel } from "./list";

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
    LABELS: {
      LIST: "/labels/list",
      CREATE: "/labels",
      UPDATE: "/labels/{id}",
      DELETE: "/labels/{id}",
    },
  },
}));

import { api } from "../utils/api";

describe("labels/list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchLabels", () => {
    test("calls api.get and returns structured result", async () => {
      api.get.mockResolvedValue({
        data: { content: [{ id: 1, name: "React" }], totalPages: 1, totalElements: 1, number: 0 },
      });

      const result = await searchLabels("React");

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result.content).toEqual([{ id: 1, name: "React" }]);
      expect(result.totalPages).toBe(1);
      expect(result.totalElements).toBe(1);
    });

    test("appends name param when searchTerm is provided", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      });

      await searchLabels("JavaScript");

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("name=JavaScript");
    });

    test("does not append name param when searchTerm is empty", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      });

      await searchLabels("");

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).not.toContain("name=");
    });

    test("uses default page=0 and size=20", async () => {
      api.get.mockResolvedValue({
        data: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      });

      await searchLabels();

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("page=0");
      expect(calledUrl).toContain("size=20");
    });

    test("returns defaults when response data is missing fields", async () => {
      api.get.mockResolvedValue({ data: {} });

      const result = await searchLabels();

      expect(result.content).toEqual([]);
      expect(result.totalPages).toBe(0);
      expect(result.totalElements).toBe(0);
    });

    test("throws error with message when api.get fails", async () => {
      api.get.mockRejectedValue(new Error("Network error"));

      await expect(searchLabels("test")).rejects.toThrow("Error fetching labels");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("server");
      err.response = { data: { message: "Custom label error" } };
      api.get.mockRejectedValue(err);

      await expect(searchLabels()).rejects.toThrow("Custom label error");
    });
  });

  describe("createLabel", () => {
    test("calls api.post with correct endpoint and payload", async () => {
      const labelData = { name: "New Label", workId: 1 };
      api.post.mockResolvedValue({ data: { id: 1, name: "New Label" } });

      const result = await createLabel(labelData);

      expect(api.post).toHaveBeenCalledWith("/labels", {
        name: "New Label",
        workId: 1,
      });
      expect(result).toEqual({ id: 1, name: "New Label" });
    });

    test("uses null for workId when not provided", async () => {
      api.post.mockResolvedValue({ data: { id: 2, name: "Label" } });

      await createLabel({ name: "Label" });

      expect(api.post).toHaveBeenCalledWith("/labels", {
        name: "Label",
        workId: null,
      });
    });

    test("throws error when api.post fails", async () => {
      api.post.mockRejectedValue(new Error("API Error"));

      await expect(createLabel({ name: "x" })).rejects.toThrow(
        "Error creating label"
      );
    });

    test("throws error with response message when available", async () => {
      const err = new Error("conflict");
      err.response = { data: { message: "Label already exists" } };
      api.post.mockRejectedValue(err);

      await expect(createLabel({ name: "x" })).rejects.toThrow(
        "Label already exists"
      );
    });
  });

  describe("updateLabel", () => {
    test("calls api.put with correct URL and payload", async () => {
      api.put.mockResolvedValue({ data: { id: 1, name: "Updated" } });

      const result = await updateLabel(1, { name: "Updated" });

      expect(api.put).toHaveBeenCalledWith("/labels/1", { name: "Updated" });
      expect(result).toEqual({ id: 1, name: "Updated" });
    });

    test("throws error when api.put fails", async () => {
      api.put.mockRejectedValue(new Error("Update error"));

      await expect(updateLabel(1, { name: "x" })).rejects.toThrow(
        "Error updating label"
      );
    });

    test("throws error with response message when available", async () => {
      const err = new Error("server");
      err.response = { data: { message: "Update failed" } };
      api.put.mockRejectedValue(err);

      await expect(updateLabel(1, {})).rejects.toThrow("Update failed");
    });
  });

  describe("deleteLabel", () => {
    test("calls api.delete with correct URL", async () => {
      api.delete.mockResolvedValue({ status: 204 });

      await deleteLabel(1);

      expect(api.delete).toHaveBeenCalledWith("/labels/1");
    });

    test("returns true when status is 204", async () => {
      api.delete.mockResolvedValue({ status: 204 });

      const result = await deleteLabel(1);

      expect(result).toBe(true);
    });

    test("returns true when status is 200", async () => {
      api.delete.mockResolvedValue({ status: 200 });

      const result = await deleteLabel(2);

      expect(result).toBe(true);
    });

    test("throws error when api.delete fails", async () => {
      api.delete.mockRejectedValue(new Error("Delete error"));

      await expect(deleteLabel(1)).rejects.toThrow("Error deleting label");
    });

    test("throws error with response message when available", async () => {
      const err = new Error("server");
      err.response = { data: { message: "Not allowed to delete" } };
      api.delete.mockRejectedValue(err);

      await expect(deleteLabel(1)).rejects.toThrow("Not allowed to delete");
    });
  });
});
