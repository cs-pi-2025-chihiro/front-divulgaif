import { renderHook, act, waitFor } from "@testing-library/react";
import { useLinks, pageAtom, sizeAtom, searchAtom } from "./useLinks";
import { searchLinks } from "../../../../services/links/list";

jest.mock("../../../../services/links/list", () => ({
  searchLinks: jest.fn(),
}));

jest.mock("jotai", () => ({
  atom: jest.fn((initialValue) => ({
    toString: () => `atom(${initialValue})`,
    init: initialValue,
  })),
  useAtom: jest.fn(),
}));

import { useAtom } from "jotai";

const mockAtoms = (page = 0, size = 20, search = "") => {
  useAtom
    .mockReturnValueOnce([page, jest.fn()])
    .mockReturnValueOnce([size, jest.fn()])
    .mockReturnValueOnce([search, jest.fn()]);
};

describe("useLinks Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  describe("initial fetch on mount", () => {
    test("calls searchLinks with search, page, and size from atoms", async () => {
      mockAtoms(0, 20, "");
      searchLinks.mockResolvedValue({ content: [], totalPages: 0, totalElements: 0 });

      renderHook(() => useLinks());

      await waitFor(() => expect(searchLinks).toHaveBeenCalledWith("", 0, 20));
    });

    test("passes custom atom values to searchLinks", async () => {
      mockAtoms(2, 10, "react");
      searchLinks.mockResolvedValue({ content: [], totalPages: 0, totalElements: 0 });

      renderHook(() => useLinks());

      await waitFor(() => expect(searchLinks).toHaveBeenCalledWith("react", 2, 10));
    });
  });

  describe("successful fetch", () => {
    test("sets links, totalPages, and totalLinks from response", async () => {
      const mockContent = [{ id: 1, name: "GitHub" }, { id: 2, name: "GitLab" }];
      mockAtoms(0, 20, "");
      searchLinks.mockResolvedValue({
        content: mockContent,
        totalPages: 3,
        totalElements: 25,
      });

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.links).toEqual(mockContent);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.totalLinks).toBe(25);
    });

    test("defaults links to [] when response.content is undefined", async () => {
      mockAtoms(0, 20, "");
      searchLinks.mockResolvedValue({
        content: undefined,
        totalPages: 1,
        totalElements: 0,
      });

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.links).toEqual([]);
    });

    test("defaults totalPages to 0 when response.totalPages is undefined", async () => {
      mockAtoms(0, 20, "");
      searchLinks.mockResolvedValue({
        content: [],
        totalPages: undefined,
        totalElements: 0,
      });

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalPages).toBe(0);
    });

    test("defaults totalLinks to 0 when response.totalElements is undefined", async () => {
      mockAtoms(0, 20, "");
      searchLinks.mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: undefined,
      });

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalLinks).toBe(0);
    });
  });

  describe("error handling", () => {
    test("sets links to [] and logs error when searchLinks rejects", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const mockError = new Error("Network failure");
      mockAtoms(0, 20, "");
      searchLinks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.links).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching links:", mockError);

      consoleSpy.mockRestore();
    });

    test("isLoading is set back to false after an error", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      mockAtoms(0, 20, "");
      searchLinks.mockRejectedValue(new Error("fail"));

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  describe("isLoading flag", () => {
    test("isLoading becomes true during fetch and false after", async () => {
      mockAtoms(0, 20, "");
      let resolveFn;
      searchLinks.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFn = resolve;
          }),
      );

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(searchLinks).toHaveBeenCalled());
      expect(result.current.isLoading).toBe(true);

      act(() => {
        resolveFn({ content: [], totalPages: 0, totalElements: 0 });
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  describe("refetch function", () => {
    test("refetch is returned and is a function", async () => {
      mockAtoms(0, 20, "");
      searchLinks.mockResolvedValue({ content: [], totalPages: 0, totalElements: 0 });

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(typeof result.current.refetch).toBe("function");
    });

    test("calling refetch invokes searchLinks again", async () => {
      mockAtoms(0, 20, "");
      searchLinks.mockResolvedValue({ content: [{ id: 99 }], totalPages: 1, totalElements: 1 });

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const before = searchLinks.mock.calls.length;

      await act(async () => {
        await result.current.refetch();
      });

      expect(searchLinks.mock.calls.length).toBeGreaterThan(before);
    });

    test("refetch updates state with fresh data", async () => {
      mockAtoms(0, 20, "");
      searchLinks
        .mockResolvedValueOnce({ content: [{ id: 1 }], totalPages: 1, totalElements: 1 })
        .mockResolvedValueOnce({ content: [{ id: 1 }, { id: 2 }], totalPages: 1, totalElements: 2 });

      const { result } = renderHook(() => useLinks());

      await waitFor(() => expect(result.current.links).toHaveLength(1));

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => expect(result.current.links).toHaveLength(2));
      expect(result.current.totalLinks).toBe(2);
    });
  });

  describe("useEffect dependency re-fetch", () => {
    test("fetchLinks is called again when filters prop changes", async () => {
      mockAtoms(0, 20, "");
      searchLinks.mockResolvedValue({ content: [], totalPages: 0, totalElements: 0 });

      let currentFilters = {};
      const { rerender } = renderHook(({ filters }) => useLinks(filters), {
        initialProps: { filters: currentFilters },
      });

      await waitFor(() => expect(searchLinks).toHaveBeenCalledTimes(1));

      mockAtoms(0, 20, "");
      currentFilters = { type: "ARTICLE" };
      rerender({ filters: currentFilters });

      await waitFor(() => expect(searchLinks).toHaveBeenCalledTimes(2));
    });
  });
});
