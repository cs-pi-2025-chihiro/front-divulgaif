import { renderHook, act } from "@testing-library/react";
import { useCreateWork } from "./useCreateWork";
import { createWork } from "../../../services/works/createWork";
import { WORK_STATUS } from "../../../enums/workStatus";

jest.mock("../../../services/works/createWork");

describe("useCreateWork", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initial state: isLoading=false, error=null", () => {
    const { result } = renderHook(() => useCreateWork());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("createWork calls service with workData and status, returns result", async () => {
    createWork.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useCreateWork());

    let returnVal;
    await act(async () => {
      returnVal = await result.current.createWork({ title: "Test" }, "DRAFT");
    });

    expect(createWork).toHaveBeenCalledWith({ title: "Test" }, "DRAFT");
    expect(returnVal).toEqual({ id: 1 });
  });

  test("createWork uses default status 'draft' when not provided", async () => {
    createWork.mockResolvedValue({ id: 2 });
    const { result } = renderHook(() => useCreateWork());

    await act(async () => {
      await result.current.createWork({ title: "Test" });
    });

    expect(createWork).toHaveBeenCalledWith({ title: "Test" }, "draft");
  });

  test("saveDraft calls createWork with DRAFT status", async () => {
    createWork.mockResolvedValue({ id: 3 });
    const { result } = renderHook(() => useCreateWork());

    await act(async () => {
      await result.current.saveDraft({ title: "Draft" });
    });

    expect(createWork).toHaveBeenCalledWith({ title: "Draft" }, WORK_STATUS.DRAFT);
  });

  test("submitForReview calls createWork with SUBMITTED status", async () => {
    createWork.mockResolvedValue({ id: 4 });
    const { result } = renderHook(() => useCreateWork());

    await act(async () => {
      await result.current.submitForReview({ title: "Review" });
    });

    expect(createWork).toHaveBeenCalledWith({ title: "Review" }, WORK_STATUS.SUBMITTED);
  });

  test("publish calls createWork with PUBLISHED status", async () => {
    createWork.mockResolvedValue({ id: 5 });
    const { result } = renderHook(() => useCreateWork());

    await act(async () => {
      await result.current.publish({ title: "Published" });
    });

    expect(createWork).toHaveBeenCalledWith({ title: "Published" }, WORK_STATUS.PUBLISHED);
  });

  test("sets isLoading=true during call and false after", async () => {
    let resolvePromise;
    createWork.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );
    const { result } = renderHook(() => useCreateWork());

    let actionPromise;
    act(() => {
      actionPromise = result.current.createWork({ title: "Test" });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise({ id: 1 });
      await actionPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("throws error and resets isLoading when service fails", async () => {
    const error = new Error("Create failed");
    createWork.mockRejectedValue(error);
    const { result } = renderHook(() => useCreateWork());

    await act(async () => {
      await expect(
        result.current.createWork({ title: "Test" })
      ).rejects.toThrow("Create failed");
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("clears error (null) at the start of each call", async () => {
    const error = new Error("First error");
    createWork.mockRejectedValueOnce(error);
    createWork.mockResolvedValueOnce({ id: 1 });

    const { result } = renderHook(() => useCreateWork());

    // Trigger error first
    await act(async () => {
      await expect(result.current.createWork({ title: "Test" })).rejects.toThrow();
    });

    // Second call should succeed; error should not persist
    await act(async () => {
      await result.current.createWork({ title: "Test2" });
    });

    expect(result.current.error).toBeNull();
  });
});
