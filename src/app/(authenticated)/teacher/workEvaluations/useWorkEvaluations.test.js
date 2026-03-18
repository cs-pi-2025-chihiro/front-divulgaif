import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import {
  useWorkEvaluations,
  pageAtom,
  sizeAtom,
  searchAtom,
} from "./useWorkEvaluations";
import { listWorks } from "../../../../services/works/list";
import { WORK_STATUS } from "../../../../enums/workStatus";
import { PAGE_SIZE } from "../../../../constants";

jest.mock("../../../../services/works/list");
jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

import { useDebounce } from "@uidotdev/usehooks";

describe("useWorkEvaluations Hook", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    jest.clearAllMocks();
    useDebounce.mockImplementation((value) => value);
  });

  const wrapper = ({ children }) => (
    <Provider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );

  describe("exported atoms", () => {
    test("pageAtom is exported and accessible", () => {
      expect(pageAtom).toBeDefined();
    });

    test("sizeAtom is exported and accessible", () => {
      expect(sizeAtom).toBeDefined();
    });

    test("searchAtom is exported and accessible", () => {
      expect(searchAtom).toBeDefined();
    });
  });

  describe("fetchWorks / workStatus injection", () => {
    test("always injects SUBMITTED,PENDING_CHANGES as workStatus", async () => {
      listWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.objectContaining({
          workStatus: WORK_STATUS.SUBMITTED + "," + WORK_STATUS.PENDING_CHANGES,
        }),
      );
    });

    test("merges appliedFilters while still injecting workStatus", async () => {
      listWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(
        () => useWorkEvaluations({ workTypes: "ARTICLE" }),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.objectContaining({
          workTypes: "ARTICLE",
          workStatus: WORK_STATUS.SUBMITTED + "," + WORK_STATUS.PENDING_CHANGES,
        }),
      );
    });

    test("propagates errors thrown by listWorks", async () => {
      listWorks.mockRejectedValue(new Error("API Error"));

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.works).toEqual([]);
    });
  });

  describe("combinedFilters search branching", () => {
    test("does NOT add search key when debouncedSearch is empty", async () => {
      useDebounce.mockImplementation(() => "");
      listWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.not.objectContaining({ search: expect.anything() }),
      );
    });

    test("does NOT add search key when debouncedSearch is whitespace only", async () => {
      useDebounce.mockImplementation(() => "   ");
      listWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.not.objectContaining({ search: expect.anything() }),
      );
    });

    test("ADDS trimmed search key when debouncedSearch has content", async () => {
      useDebounce.mockImplementation(() => "  tcc  ");
      listWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.objectContaining({ search: "tcc" }),
      );
    });
  });

  describe("return values", () => {
    test("returns works, totalWorks, and totalPages from API response", async () => {
      const mockWorks = [{ id: 1 }, { id: 2 }];
      listWorks.mockResolvedValue({
        data: { content: mockWorks, totalElements: 2, totalPages: 1 },
      });

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.works).toEqual(mockWorks);
      expect(result.current.totalWorks).toBe(2);
      expect(result.current.totalPages).toBe(1);
    });

    test("returns empty defaults when response is undefined", async () => {
      listWorks.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test("returns empty defaults when response.data is null", async () => {
      listWorks.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test("returns empty defaults when content/totals are missing", async () => {
      listWorks.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test("isLoading is true while fetch is in-flight", () => {
      listWorks.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 300)),
      );

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    test("exposes a callable refetch that re-invokes listWorks", async () => {
      listWorks.mockResolvedValue({
        data: { content: [{ id: 1 }], totalElements: 1, totalPages: 1 },
      });

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(typeof result.current.refetch).toBe("function");

      const before = listWorks.mock.calls.length;
      await result.current.refetch();
      expect(listWorks.mock.calls.length).toBeGreaterThan(before);
    });

    test("error is populated when API rejects", async () => {
      listWorks.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useWorkEvaluations(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.error).toBeDefined();
    });
  });
});
