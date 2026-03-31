/**
 * @jest-environment jsdom
 */
import { uploadImage } from "./uploadImage";

jest.mock("../utils/api", () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock("../../enums/endpoints", () => ({
  ENDPOINTS: {
    STORAGE: {
      UPLOAD: "/storage",
    },
  },
}));

import { api } from "../utils/api";

describe("uploadImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls api.post with correct endpoint and FormData", async () => {
    const mockFile = new File(["content"], "image.png", { type: "image/png" });
    api.post.mockResolvedValue({ data: { url: "https://example.com/image.png" } });

    await uploadImage(mockFile);

    expect(api.post).toHaveBeenCalledTimes(1);
    const [endpoint, formData, config] = api.post.mock.calls[0];
    expect(endpoint).toBe("/storage");
    expect(formData).toBeInstanceOf(FormData);
    expect(config.headers["Content-Type"]).toBe("multipart/form-data");
  });

  test("returns response.data on success", async () => {
    const mockFile = new File(["content"], "image.png", { type: "image/png" });
    const mockData = { url: "https://example.com/image.png" };
    api.post.mockResolvedValue({ data: mockData });

    const result = await uploadImage(mockFile);

    expect(result).toEqual(mockData);
  });

  test("appends file to FormData with key 'file'", async () => {
    const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });
    api.post.mockResolvedValue({ data: {} });

    await uploadImage(mockFile);

    const formData = api.post.mock.calls[0][1];
    expect(formData.get("file")).toBe(mockFile);
  });

  test("re-throws 401 error directly", async () => {
    const authError = new Error("Unauthorized");
    authError.response = { status: 401 };
    api.post.mockRejectedValue(authError);

    const mockFile = new File(["content"], "image.png", { type: "image/png" });

    await expect(uploadImage(mockFile)).rejects.toBe(authError);
  });

  test("throws generic Error for non-401 errors with message", async () => {
    const serverError = new Error("Server Error");
    serverError.response = { status: 500, data: { message: "Storage full" } };
    api.post.mockRejectedValue(serverError);

    const mockFile = new File(["content"], "image.png", { type: "image/png" });

    await expect(uploadImage(mockFile)).rejects.toThrow("Storage full");
  });

  test("throws error with data.error when message is not available", async () => {
    const serverError = new Error("Server Error");
    serverError.response = { status: 500, data: { error: "Upload failed" } };
    api.post.mockRejectedValue(serverError);

    const mockFile = new File(["content"], "image.png", { type: "image/png" });

    await expect(uploadImage(mockFile)).rejects.toThrow("Upload failed");
  });

  test("throws fallback error message when no response data available", async () => {
    const networkError = new Error("Connection refused");
    api.post.mockRejectedValue(networkError);

    const mockFile = new File(["content"], "image.png", { type: "image/png" });

    await expect(uploadImage(mockFile)).rejects.toThrow(
      "Erro ao fazer upload da imagem: Connection refused"
    );
  });
});
