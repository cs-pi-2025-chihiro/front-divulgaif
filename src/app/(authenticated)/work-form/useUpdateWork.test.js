import { renderHook, act } from "@testing-library/react";
import { useUpdateWork } from "./useUpdateWork";
import { updateWork } from "../../../services/works/updateWork";
import { WORK_STATUS } from "../../../enums/workStatus";

jest.mock("../../../services/works/updateWork");

describe("useUpdateWork", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initial state: isLoading=false, error=null", () => {
    const { result } = renderHook(() => useUpdateWork());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("updateWork calls service with workId, workData and status", async () => {
    updateWork.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useUpdateWork());

    let returnVal;
    await act(async () => {
      returnVal = await result.current.updateWork(1, { title: "Test" }, WORK_STATUS.DRAFT);
    });

    expect(updateWork).toHaveBeenCalledWith(1, { title: "Test" }, WORK_STATUS.DRAFT);
    expect(returnVal).toEqual({ id: 1 });
  });

  test("updateWork uses default status WORK_STATUS.DRAFT when not provided", async () => {
    updateWork.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useUpdateWork());

    await act(async () => {
      await result.current.updateWork(1, { title: "Test" });
    });

    expect(updateWork).toHaveBeenCalledWith(1, { title: "Test" }, WORK_STATUS.DRAFT);
  });

  test("saveDraft calls updateWork with DRAFT status", async () => {
    updateWork.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useUpdateWork());

    await act(async () => {
      await result.current.saveDraft(1, { title: "Draft" });
    });

    expect(updateWork).toHaveBeenCalledWith(1, { title: "Draft" }, WORK_STATUS.DRAFT);
  });

  test("submitForReview calls updateWork with SUBMITTED status", async () => {
    updateWork.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useUpdateWork());

    await act(async () => {
      await result.current.submitForReview(1, { title: "Review" });
    });

    expect(updateWork).toHaveBeenCalledWith(1, { title: "Review" }, WORK_STATUS.SUBMITTED);
  });

  test("sets isLoading=true during call", async () => {
    let resolvePromise;
    updateWork.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );
    const { result } = renderHook(() => useUpdateWork());

    let actionPromise;
    act(() => {
      actionPromise = result.current.updateWork(1, { title: "Test" });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise({ id: 1 });
      await actionPromise;
    });
  });

  test("sets error from response.data.error when available", async () => {
    const error = new Error("API Error");
    error.response = { data: { error: "Custom backend error" } };
    updateWork.mockRejectedValue(error);
    const { result } = renderHook(() => useUpdateWork());

    await act(async () => {
      await expect(
        result.current.updateWork(1, {}, WORK_STATUS.DRAFT)
      ).rejects.toThrow("API Error");
    });

    expect(result.current.error).toBe("Custom backend error");
  });

  test("sets error from error.message when no response.data.error", async () => {
    const error = new Error("Network Error");
    updateWork.mockRejectedValue(error);
    const { result } = renderHook(() => useUpdateWork());

    await act(async () => {
      await expect(
        result.current.updateWork(1, {}, WORK_STATUS.DRAFT)
      ).rejects.toThrow("Network Error");
    });

    expect(result.current.error).toBe("Network Error");
  });

  test("sets fallback error message when no response and no message", async () => {
    const error = {};
    updateWork.mockRejectedValue(error);
    const { result } = renderHook(() => useUpdateWork());

    await act(async () => {
      await expect(
        result.current.updateWork(1, {}, WORK_STATUS.DRAFT)
      ).rejects.toEqual({});
    });

    expect(result.current.error).toBe("An unexpected error occurred.");
  });

  test("clears error (null) at start of each new call", async () => {
    const error = new Error("First error");
    updateWork.mockRejectedValueOnce(error);
    updateWork.mockResolvedValueOnce({ id: 1 });

    const { result } = renderHook(() => useUpdateWork());

    await act(async () => {
      await expect(result.current.updateWork(1, {})).rejects.toThrow();
    });

    // Second call resets error to null then succeeds
    await act(async () => {
      await result.current.updateWork(1, {});
    });

    expect(result.current.error).toBeNull();
  });
});
