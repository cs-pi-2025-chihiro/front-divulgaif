import { getDashboardData } from "./get";
import { getAuthorsData } from "./getAuthors";
import { getLabelsData } from "./getLabels";

jest.mock("../utils/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

jest.mock("../../enums/endpoints", () => ({
  ENDPOINTS: {
    DASHBOARD: {
      GET: "/dashboards",
      GET_AUTHORS: "/dashboards/authors",
      GET_LABELS: "/dashboards/labels",
    },
  },
}));

import { api } from "../utils/api";

describe("dashboard services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardData", () => {
    test("calls api.get with correct endpoint and returns data", async () => {
      const mockData = { totalWorks: 10, totalAuthors: 5 };
      api.get.mockResolvedValue({ data: mockData });

      const result = await getDashboardData();

      expect(api.get).toHaveBeenCalledWith("/dashboards");
      expect(result).toEqual(mockData);
    });

    test("throws error when api.get fails", async () => {
      const error = new Error("Server error");
      api.get.mockRejectedValue(error);

      await expect(getDashboardData()).rejects.toThrow("Server error");
    });
  });

  describe("getAuthorsData", () => {
    test("calls api.get with correct endpoint and returns data", async () => {
      const mockData = [{ id: 1, name: "Author One" }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await getAuthorsData();

      expect(api.get).toHaveBeenCalledWith("/dashboards/authors");
      expect(result).toEqual(mockData);
    });

    test("throws error when api.get fails", async () => {
      const error = new Error("Network error");
      api.get.mockRejectedValue(error);

      await expect(getAuthorsData()).rejects.toThrow("Network error");
    });
  });

  describe("getLabelsData", () => {
    test("calls api.get with correct endpoint and returns data", async () => {
      const mockData = [{ id: 1, name: "Label One" }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await getLabelsData();

      expect(api.get).toHaveBeenCalledWith("/dashboards/labels");
      expect(result).toEqual(mockData);
    });

    test("throws error when api.get fails", async () => {
      const error = new Error("Network error");
      api.get.mockRejectedValue(error);

      await expect(getLabelsData()).rejects.toThrow("Network error");
    });
  });
});
