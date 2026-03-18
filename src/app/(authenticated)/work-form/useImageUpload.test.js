import { renderHook, act } from "@testing-library/react";
import { useImageUpload } from "./useImageUpload";
import { uploadImage } from "../../../services/storage/uploadImage";

jest.mock("../../../services/storage/uploadImage");

describe("useImageUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initial state: isUploading=false, uploadError=null", () => {
    const { result } = renderHook(() => useImageUpload());
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadError).toBeNull();
  });

  test("returns null when file is null", async () => {
    const { result } = renderHook(() => useImageUpload());

    let returnVal;
    await act(async () => {
      returnVal = await result.current.handleImageUpload(null);
    });

    expect(returnVal).toBeNull();
    expect(uploadImage).not.toHaveBeenCalled();
    expect(result.current.isUploading).toBe(false);
  });

  test("returns null when file is undefined", async () => {
    const { result } = renderHook(() => useImageUpload());

    let returnVal;
    await act(async () => {
      returnVal = await result.current.handleImageUpload(undefined);
    });

    expect(returnVal).toBeNull();
    expect(uploadImage).not.toHaveBeenCalled();
  });

  test("calls uploadImage and returns url on success", async () => {
    uploadImage.mockResolvedValue("https://example.com/image.jpg");
    const { result } = renderHook(() => useImageUpload());

    let returnVal;
    await act(async () => {
      returnVal = await result.current.handleImageUpload(new File([""], "test.jpg"));
    });

    expect(uploadImage).toHaveBeenCalled();
    expect(returnVal).toBe("https://example.com/image.jpg");
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadError).toBeNull();
  });

  test("sets isUploading=true during upload and false after", async () => {
    let resolvePromise;
    uploadImage.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );
    const { result } = renderHook(() => useImageUpload());

    let actionPromise;
    act(() => {
      actionPromise = result.current.handleImageUpload(new File([""], "test.jpg"));
    });

    expect(result.current.isUploading).toBe(true);

    await act(async () => {
      resolvePromise("https://example.com/image.jpg");
      await actionPromise;
    });

    expect(result.current.isUploading).toBe(false);
  });

  test("sets uploadError and rethrows on failure", async () => {
    const error = new Error("Upload failed");
    uploadImage.mockRejectedValue(error);
    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await expect(
        result.current.handleImageUpload(new File([""], "test.jpg"))
      ).rejects.toThrow("Upload failed");
    });

    expect(result.current.uploadError).toBe("Upload failed");
    expect(result.current.isUploading).toBe(false);
  });

  test("clears uploadError at start of new upload", async () => {
    const error = new Error("First failure");
    uploadImage.mockRejectedValueOnce(error);
    uploadImage.mockResolvedValueOnce("https://example.com/image.jpg");

    const { result } = renderHook(() => useImageUpload());

    // First call fails
    await act(async () => {
      await expect(
        result.current.handleImageUpload(new File([""], "fail.jpg"))
      ).rejects.toThrow();
    });

    expect(result.current.uploadError).toBe("First failure");

    // Second call succeeds
    await act(async () => {
      await result.current.handleImageUpload(new File([""], "success.jpg"));
    });

    expect(result.current.uploadError).toBeNull();
  });
});
