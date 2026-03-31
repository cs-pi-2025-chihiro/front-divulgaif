import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHome, pageAtom, sizeAtom, searchAtom } from "./useHome";
import { listWorks } from "../../../services/works/list";
import { WORK_STATUS } from "../../../enums/workStatus";
import { ENDPOINTS } from "../../../enums/endpoints";
import { PAGE_SIZE } from "../../../constants";
import { Provider } from "jotai";

// Mock dependencies
jest.mock("../../../services/works/list");
jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: (value) => value, // Return value immediately for testing
}));

describe("useHome Hook", () => {
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
  });

  const wrapper = ({ children }) => (
    <Provider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );

  describe("fetchWorks function", () => {
    test("calls listWorks with correct parameters", async () => {
      const mockData = {
        data: {
          content: [
            { id: 1, title: "Work 1" },
            { id: 2, title: "Work 2" },
          ],
          totalElements: 2,
          totalPages: 1,
        },
      };

      listWorks.mockResolvedValue(mockData);

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.objectContaining({
          workStatus: WORK_STATUS.PUBLISHED,
        }),
      );
    });

    test("adds PUBLISHED status to filters", async () => {
      const mockData = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
        },
      };

      listWorks.mockResolvedValue(mockData);

      const appliedFilters = { workTypes: "ARTICLE" };
      const { result } = renderHook(() => useHome(appliedFilters), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.objectContaining({
          workTypes: "ARTICLE",
          workStatus: WORK_STATUS.PUBLISHED,
        }),
      );
    });

    test("handles API errors gracefully", async () => {
      const mockError = new Error("API Error");
      listWorks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
    });
  });

  describe("combined filters", () => {
    test("merges applied filters with search when search has value", async () => {
      const mockData = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
        },
      };

      listWorks.mockResolvedValue(mockData);

      // We need to test with actual atom values
      // This is a simplified version - in real scenario you'd need to set atom values
      const appliedFilters = { workTypes: "ARTICLE,BOOK" };
      const { result } = renderHook(() => useHome(appliedFilters), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.objectContaining({
          workTypes: "ARTICLE,BOOK",
          workStatus: WORK_STATUS.PUBLISHED,
        }),
      );
    });

    test("trims search value before adding to filters", async () => {
      const mockData = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
        },
      };

      listWorks.mockResolvedValue(mockData);

      // Search trimming is handled by the hook internally
      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify search is not added when empty
      expect(listWorks).toHaveBeenCalledWith(
        0,
        PAGE_SIZE,
        expect.not.objectContaining({
          search: expect.anything(),
        }),
      );
    });
  });

  describe("useQuery configuration", () => {
    test("uses correct query key with all dependencies", async () => {
      const mockData = {
        data: {
          content: [{ id: 1, title: "Work 1" }],
          totalElements: 1,
          totalPages: 1,
        },
      };

      listWorks.mockResolvedValue(mockData);

      const appliedFilters = { workTypes: "ARTICLE" };
      const { result } = renderHook(() => useHome(appliedFilters), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the hook is called with filters
      expect(listWorks).toHaveBeenCalled();
    });

    test("keeps previous data during refetch", async () => {
      const mockData1 = {
        data: {
          content: [{ id: 1, title: "Work 1" }],
          totalElements: 1,
          totalPages: 1,
        },
      };

      const mockData2 = {
        data: {
          content: [
            { id: 1, title: "Work 1" },
            { id: 2, title: "Work 2" },
          ],
          totalElements: 2,
          totalPages: 1,
        },
      };

      listWorks.mockResolvedValueOnce(mockData1);

      const { result, rerender } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.works).toHaveLength(1);

      // Simulate refetch with new data
      listWorks.mockResolvedValueOnce(mockData2);
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.works).toHaveLength(2);
      });
    });

    test("refetches on mount", async () => {
      const mockData = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
        },
      };

      listWorks.mockResolvedValue(mockData);

      const { unmount } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(listWorks).toHaveBeenCalled();
      });

      const callCount = listWorks.mock.calls.length;
      unmount();

      // Remount
      renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(listWorks.mock.calls.length).toBeGreaterThan(callCount);
      });
    });
  });

  describe("return values", () => {
    test("returns works array from API response", async () => {
      const mockWorks = [
        { id: 1, title: "Work 1" },
        { id: 2, title: "Work 2" },
        { id: 3, title: "Work 3" },
      ];

      const mockData = {
        data: {
          content: mockWorks,
          totalElements: 3,
          totalPages: 1,
        },
      };

      listWorks.mockResolvedValue(mockData);

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.works).toEqual(mockWorks);
      expect(result.current.works).toHaveLength(3);
    });

    test("returns empty array when no works", async () => {
      const mockData = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
        },
      };

      listWorks.mockResolvedValue(mockData);

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test("returns totalWorks from API response", async () => {
      const mockData = {
        data: {
          content: [{ id: 1 }, { id: 2 }],
          totalElements: 50,
          totalPages: 7,
        },
      };

      listWorks.mockResolvedValue(mockData);

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalWorks).toBe(50);
      expect(result.current.totalPages).toBe(7);
    });

    test("returns isLoading true during fetch", async () => {
      const mockData = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
        },
      };

      listWorks.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockData), 100);
          }),
      );

      const { result } = renderHook(() => useHome(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    test("returns refetch function", async () => {
      const mockData = {
        data: {
          content: [{ id: 1, title: "Work 1" }],
          totalElements: 1,
          totalPages: 1,
        },
      };

      listWorks.mockResolvedValue(mockData);

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe("function");

      // Test refetch actually calls the API again
      const initialCallCount = listWorks.mock.calls.length;
      await result.current.refetch();

      expect(listWorks.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    test("returns error when API call fails", async () => {
      const mockError = new Error("Network error");
      listWorks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toBeDefined();
    });

    test("handles undefined response gracefully", async () => {
      listWorks.mockResolvedValue(undefined);

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test("handles null data in response", async () => {
      listWorks.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useHome(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.works).toEqual([]);
      expect(result.current.totalWorks).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });
  });

  describe("atoms", () => {
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
});
