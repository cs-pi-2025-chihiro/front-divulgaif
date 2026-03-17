import { getWork } from "./get";

jest.mock("../utils/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("../../enums/endpoints", () => ({
  ENDPOINTS: {
    WORKS: {
      GET: "/works",
    },
  },
}));

import api from "../utils/api";

describe("getWork", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls api.get with the correct URL including the id", async () => {
    api.get.mockResolvedValue({ data: { id: 1, title: "Work One" } });

    await getWork(1);

    expect(api.get).toHaveBeenCalledWith("/works/1");
  });

  test("returns response.data on success", async () => {
    const mockData = { id: 42, title: "Test Work" };
    api.get.mockResolvedValue({ data: mockData });

    const result = await getWork(42);

    expect(result).toEqual(mockData);
  });

  test("uses the provided id in the URL", async () => {
    api.get.mockResolvedValue({ data: {} });

    await getWork(99);

    expect(api.get).toHaveBeenCalledWith("/works/99");
  });

  test("propagates errors from api.get", async () => {
    const error = new Error("Not Found");
    api.get.mockRejectedValue(error);

    await expect(getWork(1)).rejects.toThrow("Not Found");
  });

  test("propagates 500 server errors", async () => {
    const serverError = new Error("Internal Server Error");
    serverError.response = { status: 500 };
    api.get.mockRejectedValue(serverError);

    await expect(getWork(1)).rejects.toThrow("Internal Server Error");
  });
});
