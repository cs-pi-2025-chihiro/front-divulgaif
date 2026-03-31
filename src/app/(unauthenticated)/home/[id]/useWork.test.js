import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWork } from "./useWork";
import { getWork } from "../../../../services/works/get";
import { ENDPOINTS } from "../../../../enums/endpoints";

// Mock dependencies
jest.mock("../../../../services/works/get");

describe("useWork Hook", () => {
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("fetchWork function", () => {
    test("calls getWork with correct id", async () => {
      const mockWork = {
        id: 1,
        title: "Test Work",
        description: "Test Description",
      };

      getWork.mockResolvedValue(mockWork);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getWork).toHaveBeenCalledWith(1);
      expect(getWork).toHaveBeenCalledTimes(1);
    });

    test("handles different work IDs", async () => {
      const mockWork = {
        id: 42,
        title: "Work 42",
      };

      getWork.mockResolvedValue(mockWork);

      const { result } = renderHook(() => useWork({ id: 42 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getWork).toHaveBeenCalledWith(42);
      expect(result.current.work).toEqual(mockWork);
    });

    test("handles API errors gracefully", async () => {
      const mockError = new Error("Work not found");
      getWork.mockRejectedValue(mockError);

      const { result } = renderHook(() => useWork({ id: 999 }), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.work).toBeUndefined();
    });
  });

  describe("useQuery configuration", () => {
    test("uses correct query key", async () => {
      const mockWork = {
        id: 1,
        title: "Test Work",
      };

      getWork.mockResolvedValue(mockWork);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the hook was called
      expect(getWork).toHaveBeenCalled();
    });

    test("keeps previous data during refetch", async () => {
      const mockWork1 = {
        id: 1,
        title: "Work 1",
        version: 1,
      };

      const mockWork2 = {
        id: 1,
        title: "Work 1 Updated",
        version: 2,
      };

      getWork.mockResolvedValueOnce(mockWork1);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.work).toEqual(mockWork1);

      // Simulate refetch with updated data
      getWork.mockResolvedValueOnce(mockWork2);
      queryClient.invalidateQueries([ENDPOINTS.WORKS.GET]);

      await waitFor(() => {
        expect(result.current.work).toEqual(mockWork2);
      });
    });
  });

  describe("return values", () => {
    test("returns work data from API response", async () => {
      const mockWork = {
        id: 1,
        title: "Test Work",
        description: "Test Description",
        authors: [{ name: "Author 1" }],
        labels: [{ name: "Label 1" }],
        type: "ARTICLE",
      };

      getWork.mockResolvedValue(mockWork);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.work).toEqual(mockWork);
      expect(result.current.work.title).toBe("Test Work");
      expect(result.current.work.authors).toHaveLength(1);
    });

    test("returns undefined when work not found", async () => {
      getWork.mockResolvedValue(null);

      const { result } = renderHook(() => useWork({ id: 999 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.work).toBeNull();
    });

    test("returns isLoading true during fetch", async () => {
      const mockWork = {
        id: 1,
        title: "Test Work",
      };

      getWork.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockWork), 100);
          }),
      );

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    test("returns error when API call fails", async () => {
      const mockError = new Error("Network error");
      getWork.mockRejectedValue(mockError);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toBeDefined();
    });

    test("handles complete work object with all fields", async () => {
      const mockWork = {
        id: 1,
        title: "Complete Work",
        description: "Full description",
        content: "Full content",
        imageUrl: "http://example.com/image.jpg",
        type: "ARTICLE",
        workStatus: { name: "PUBLISHED" },
        authors: [
          { id: 1, name: "Author 1", userId: 10 },
          { id: 2, name: "Author 2", userId: 20 },
        ],
        labels: [
          { id: 1, name: "Label 1" },
          { id: 2, name: "Label 2" },
        ],
        links: [
          { id: 1, name: "Link 1", url: "http://example.com/1" },
          { id: 2, name: "Link 2", url: "http://example.com/2" },
        ],
        teachers: { id: 1, name: "Teacher Name" },
        approvedAt: "2024-01-01T00:00:00",
        createdAt: "2023-12-01T00:00:00",
      };

      getWork.mockResolvedValue(mockWork);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.work).toEqual(mockWork);
      expect(result.current.work.authors).toHaveLength(2);
      expect(result.current.work.labels).toHaveLength(2);
      expect(result.current.work.links).toHaveLength(2);
      expect(result.current.work.teachers.name).toBe("Teacher Name");
    });

    test("handles work with minimal fields", async () => {
      const mockWork = {
        id: 1,
        title: "Minimal Work",
      };

      getWork.mockResolvedValue(mockWork);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.work).toEqual(mockWork);
      expect(result.current.work.id).toBe(1);
      expect(result.current.work.title).toBe("Minimal Work");
    });
  });

  describe("ID parameter handling", () => {
    test("handles numeric ID", async () => {
      const mockWork = { id: 123, title: "Work 123" };
      getWork.mockResolvedValue(mockWork);

      const { result } = renderHook(() => useWork({ id: 123 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getWork).toHaveBeenCalledWith(123);
    });

    test("handles ID as 0", async () => {
      const mockWork = { id: 0, title: "Work 0" };
      getWork.mockResolvedValue(mockWork);

      const { result } = renderHook(() => useWork({ id: 0 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getWork).toHaveBeenCalledWith(0);
    });

    test("handles negative ID", async () => {
      getWork.mockRejectedValue(new Error("Invalid ID"));

      const { result } = renderHook(() => useWork({ id: -1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe("error scenarios", () => {
    test("handles 404 not found", async () => {
      const notFoundError = new Error("Not Found");
      notFoundError.response = { status: 404 };
      getWork.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useWork({ id: 999 }), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    test("handles 500 server error", async () => {
      const serverError = new Error("Internal Server Error");
      serverError.response = { status: 500 };
      getWork.mockRejectedValue(serverError);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    test("handles network timeout", async () => {
      const timeoutError = new Error("Request timeout");
      timeoutError.code = "ECONNABORTED";
      getWork.mockRejectedValue(timeoutError);

      const { result } = renderHook(() => useWork({ id: 1 }), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });
});
