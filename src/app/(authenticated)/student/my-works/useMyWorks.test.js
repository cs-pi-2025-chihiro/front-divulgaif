import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { useMyWorks, pageAtom, sizeAtom, searchAtom } from "./useMyWorks";
import { listMyWorks } from "../../../../services/works/listMyWorks";
import { PAGE_SIZE } from "../../../../constants";

jest.mock("../../../../services/works/listMyWorks");
jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

import { useDebounce } from "@uidotdev/usehooks";

describe("useMyWorks Hook", () => {
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

  describe("fetchWorks", () => {
    test("calls listMyWorks with page=0, PAGE_SIZE, and empty filters by default", async () => {
      listMyWorks.mockResolvedValue({
        data: { content: [{ id: 1 }], totalElements: 1, totalPages: 1 },
      });

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listMyWorks).toHaveBeenCalledWith(0, PAGE_SIZE, expect.any(Object));
    });

    test("merges appliedFilters into the query call", async () => {
      listMyWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useMyWorks({ workTypes: "ARTICLE" }), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listMyWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.objectContaining({ workTypes: "ARTICLE" }),
      );
    });

    test("propagates thrown error from listMyWorks", async () => {
      listMyWorks.mockRejectedValue(new Error("API Error"));

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.works).toEqual([]);
    });
  });

  describe("combinedFilters search branching", () => {
    test("does NOT add search key when debouncedSearch is an empty string", async () => {
      useDebounce.mockImplementation(() => "");
      listMyWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listMyWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.not.objectContaining({ search: expect.anything() }),
      );
    });

    test("does NOT add search key when debouncedSearch is whitespace only", async () => {
      useDebounce.mockImplementation(() => "   ");
      listMyWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listMyWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.not.objectContaining({ search: expect.anything() }),
      );
    });

    test("ADDS trimmed search key when debouncedSearch has content", async () => {
      useDebounce.mockImplementation(() => "  react  ");
      listMyWorks.mockResolvedValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listMyWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.objectContaining({ search: "react" }),
      );
    });
  });

  describe("return values", () => {
    test("returns correct works, totalWorks, and totalPages from API", async () => {
      const mockWorks = [{ id: 1 }, { id: 2 }, { id: 3 }];
      listMyWorks.mockResolvedValue({
        data: { content: mockWorks, totalElements: 3, totalPages: 2 },
      });

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.works).toEqual(mockWorks);
      expect(result.current.totalWorks).toBe(3);
      expect(result.current.totalPages).toBe(2);
    });

    test("returns empty defaults when response is undefined", async () => {
      listMyWorks.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test("returns empty defaults when response.data is null", async () => {
      listMyWorks.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test("returns empty defaults when content/totalElements/totalPages are missing", async () => {
      listMyWorks.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test("isLoading is true while the fetch is in-flight", () => {
      listMyWorks.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 300)),
      );

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    test("exposes a callable refetch function that re-invokes listMyWorks", async () => {
      listMyWorks.mockResolvedValue({
        data: { content: [{ id: 1 }], totalElements: 1, totalPages: 1 },
      });

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(typeof result.current.refetch).toBe("function");

      const before = listMyWorks.mock.calls.length;
      await result.current.refetch();
      expect(listMyWorks.mock.calls.length).toBeGreaterThan(before);
    });

    test("error is populated when API rejects", async () => {
      listMyWorks.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useMyWorks(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeTruthy());

      expect(result.current.error).toBeDefined();
    });
  });
});
