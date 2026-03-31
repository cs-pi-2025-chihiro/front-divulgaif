/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useWorkNavigation, useWorkData } from "./useWorkStore";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("../storage/evaluate.storage", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../services/utils/utils", () => ({
  navigateTo: jest.fn(),
}));

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useWorkStore from "../storage/evaluate.storage";
import { navigateTo } from "../services/utils/utils";

describe("useWorkNavigation", () => {
  const mockNavigate = jest.fn();
  const mockPrepareWorkForEvaluation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useTranslation.mockReturnValue({ i18n: { language: "pt" } });
    useWorkStore.mockReturnValue({
      prepareWorkForEvaluation: mockPrepareWorkForEvaluation,
    });
  });

  test("navigateToWorkEvaluation calls prepareWorkForEvaluation with the work", () => {
    const { result } = renderHook(() => useWorkNavigation());
    const work = { id: "123", title: "Test Work" };

    act(() => {
      result.current.navigateToWorkEvaluation(work);
    });

    expect(mockPrepareWorkForEvaluation).toHaveBeenCalledWith(work);
  });

  test("navigates to pt path when language is pt", () => {
    const { result } = renderHook(() => useWorkNavigation());
    const work = { id: "123", title: "Test Work" };

    act(() => {
      result.current.navigateToWorkEvaluation(work);
    });

    expect(navigateTo).toHaveBeenCalledWith(
      "avaliar-trabalho/123",
      mockNavigate,
      "pt"
    );
  });

  test("navigates to en path when language is en", () => {
    useTranslation.mockReturnValue({ i18n: { language: "en" } });

    const { result } = renderHook(() => useWorkNavigation());
    const work = { id: "456", title: "Test Work" };

    act(() => {
      result.current.navigateToWorkEvaluation(work);
    });

    expect(navigateTo).toHaveBeenCalledWith(
      "rate-work/456",
      mockNavigate,
      "en"
    );
  });
});

describe("useWorkData", () => {
  const mockFetchAndSetWork = jest.fn();
  const mockGetWorkForEvaluation = jest.fn();
  const mockHasWorkData = jest.fn();
  const mockUpdateCurrentWork = jest.fn();
  const mockClearCurrentWork = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useWorkStore.mockReturnValue({
      currentWork: null,
      isLoading: false,
      error: null,
      fetchAndSetWork: mockFetchAndSetWork,
      getWorkForEvaluation: mockGetWorkForEvaluation,
      hasWorkData: mockHasWorkData,
      updateCurrentWork: mockUpdateCurrentWork,
      clearCurrentWork: mockClearCurrentWork,
    });
    mockGetWorkForEvaluation.mockReturnValue(null);
    mockHasWorkData.mockReturnValue(false);
  });

  test("returns workData from getWorkForEvaluation", () => {
    const mockWork = { id: "1", title: "Work" };
    mockGetWorkForEvaluation.mockReturnValue(mockWork);

    const { result } = renderHook(() => useWorkData("1"));

    expect(result.current.workData).toBe(mockWork);
  });

  test("returns hasData from hasWorkData", () => {
    mockHasWorkData.mockReturnValue(true);

    const { result } = renderHook(() => useWorkData("1"));

    expect(result.current.hasData).toBe(true);
  });

  test("returns isLoading and error from store", () => {
    useWorkStore.mockReturnValue({
      currentWork: null,
      isLoading: true,
      error: "Some error",
      fetchAndSetWork: mockFetchAndSetWork,
      getWorkForEvaluation: mockGetWorkForEvaluation,
      hasWorkData: mockHasWorkData,
      updateCurrentWork: mockUpdateCurrentWork,
      clearCurrentWork: mockClearCurrentWork,
    });
    mockGetWorkForEvaluation.mockReturnValue(null);
    mockHasWorkData.mockReturnValue(false);

    const { result } = renderHook(() => useWorkData("1"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe("Some error");
  });

  test("loadWork calls fetchAndSetWork when workId is set and hasData is false", async () => {
    mockFetchAndSetWork.mockResolvedValue({ id: "1", title: "Fetched Work" });

    const { result } = renderHook(() => useWorkData("1"));

    await act(async () => {
      await result.current.loadWork();
    });

    expect(mockFetchAndSetWork).toHaveBeenCalledWith("1");
  });

  test("loadWork returns workData without fetching when hasData is true", async () => {
    const mockWork = { id: "1", title: "Cached Work" };
    mockHasWorkData.mockReturnValue(true);
    mockGetWorkForEvaluation.mockReturnValue(mockWork);

    const { result } = renderHook(() => useWorkData("1"));

    let loadResult;
    await act(async () => {
      loadResult = await result.current.loadWork();
    });

    expect(mockFetchAndSetWork).not.toHaveBeenCalled();
    expect(loadResult).toBe(mockWork);
  });

  test("loadWork does not fetch when workId is null", async () => {
    const { result } = renderHook(() => useWorkData(null));

    await act(async () => {
      await result.current.loadWork();
    });

    expect(mockFetchAndSetWork).not.toHaveBeenCalled();
  });

  test("loadWork handles fetchAndSetWork errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockFetchAndSetWork.mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() => useWorkData("1"));

    await act(async () => {
      await result.current.loadWork();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load work:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  test("exposes updateWork and clearWork from store", () => {
    const { result } = renderHook(() => useWorkData("1"));

    expect(result.current.updateWork).toBe(mockUpdateCurrentWork);
    expect(result.current.clearWork).toBe(mockClearCurrentWork);
  });
});
