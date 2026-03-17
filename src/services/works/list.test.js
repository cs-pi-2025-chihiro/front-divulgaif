import { listWorks } from "./list";

jest.mock("../utils/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("../../enums/endpoints", () => ({
  ENDPOINTS: {
    WORKS: {
      LIST: "/works/list",
    },
  },
}));

import api from "../utils/api";

describe("listWorks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("happy path", () => {
    test("calls api.get and returns the result", async () => {
      const mockResult = { data: { content: [], totalElements: 0 } };
      api.get.mockResolvedValue(mockResult);

      const result = await listWorks();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResult);
    });

    test("uses default values (page=0, size=8, filters={})", async () => {
      api.get.mockResolvedValue({});

      await listWorks();

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("page=0");
      expect(calledUrl).toContain("size=8");
    });

    test("passes custom page and size to the URL", async () => {
      api.get.mockResolvedValue({});

      await listWorks(2, 12, {});

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("size=12");
    });

    test("includes search param when filters.search is provided", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, { search: "react" });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("search=react");
    });

    test("does not include search param when filters.search is absent", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, {});

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).not.toContain("search=");
    });

    test("appends multiple workType.name params for comma-separated workTypes", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, { workTypes: "ARTICLE,DISSERTATION" });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("workType.name=ARTICLE");
      expect(calledUrl).toContain("workType.name=DISSERTATION");
    });

    test("appends multiple workStatus.name params for comma-separated statuses", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, { workStatus: "DRAFT,PUBLISHED" });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("workStatus.name=DRAFT");
      expect(calledUrl).toContain("workStatus.name=PUBLISHED");
    });

    test("appends sort param with desc when filters.order is 'desc'", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, { order: "desc" });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("sort=createdAt%2Cdesc");
    });

    test("appends sort param with asc when filters.order is not 'desc'", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, { order: "asc" });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("sort=createdAt%2Casc");
    });

    test("appends createdAt.goe for startDate", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, { startDate: "2024-01-01" });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("createdAt.goe=2024-01-01T00%3A00%3A00");
    });

    test("appends createdAt.loe for endDate", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, { endDate: "2024-12-31" });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("createdAt.loe=2024-12-31T23%3A59%3A59");
    });

    test("appends labels.name for each label in filters.labels", async () => {
      api.get.mockResolvedValue({});

      await listWorks(0, 8, { labels: ["JavaScript", "React"] });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("labels.name=JavaScript");
      expect(calledUrl).toContain("labels.name=React");
    });

    test("uses the WORKS.LIST endpoint", async () => {
      api.get.mockResolvedValue({});

      await listWorks();

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toMatch(/^\/works\/list/);
    });

    test("combines multiple filters correctly", async () => {
      api.get.mockResolvedValue({});

      await listWorks(1, 12, {
        search: "machine learning",
        workTypes: "ARTICLE",
        order: "desc",
      });

      const calledUrl = api.get.mock.calls[0][0];
      expect(calledUrl).toContain("page=1");
      expect(calledUrl).toContain("size=12");
      expect(calledUrl).toContain("search=machine+learning");
      expect(calledUrl).toContain("workType.name=ARTICLE");
      expect(calledUrl).toContain("sort=createdAt%2Cdesc");
    });
  });

  describe("error handling", () => {
    test("propagates error thrown by api.get", async () => {
      const error = new Error("Network error");
      api.get.mockRejectedValue(error);

      await expect(listWorks()).rejects.toThrow("Network error");
    });

    test("propagates 500 server error", async () => {
      const serverError = new Error("Internal Server Error");
      serverError.response = { status: 500 };
      api.get.mockRejectedValue(serverError);

      await expect(listWorks()).rejects.toThrow("Internal Server Error");
    });
  });
});
