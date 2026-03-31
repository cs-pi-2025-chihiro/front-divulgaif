import { renderHook } from "@testing-library/react";
import { useDashboard } from "./useDashboard";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueries: jest.fn(),
  keepPreviousData: jest.fn(),
}));

jest.mock("../../../../services/dashboard/get", () => ({
  getDashboardData: jest.fn(),
}));
jest.mock("../../../../services/dashboard/getAuthors", () => ({
  getAuthorsData: jest.fn(),
}));
jest.mock("../../../../services/dashboard/getLabels", () => ({
  getLabelsData: jest.fn(),
}));

import { useQuery, useQueries } from "@tanstack/react-query";

const makeMainQuery = (overrides = {}) => ({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  ...overrides,
});

const makeDetailQuery = (overrides = {}) => ({
  data: undefined,
  isLoading: false,
  ...overrides,
});

describe("useDashboard Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("main query fields", () => {
    test("returns dashboardData, isLoading, error, and refetch from mainQuery", () => {
      const mockRefetch = jest.fn();
      const mockData = {
        totalWorksByStatus: [1],
        totalPublishedWorksByLabel: [2],
        totalPublishedWorksByAuthor: [3],
      };

      useQuery.mockReturnValue(
        makeMainQuery({ data: mockData, isLoading: false, error: null, refetch: mockRefetch })
      );
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.dashboardData).toBe(mockData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.refetch).toBe(mockRefetch);
    });

    test("isLoading is true when mainQuery is loading", () => {
      useQuery.mockReturnValue(makeMainQuery({ isLoading: true }));
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.isLoading).toBe(true);
    });

    test("error is forwarded from mainQuery", () => {
      const err = new Error("dashboard fetch failed");
      useQuery.mockReturnValue(makeMainQuery({ error: err }));
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.error).toBe(err);
    });
  });

  describe("derived array fields", () => {
    test("returns totalWorksByStatus from mainQuery.data", () => {
      const mockData = {
        totalWorksByStatus: [{ status: "PUBLISHED", count: 10 }],
        totalPublishedWorksByLabel: [],
        totalPublishedWorksByAuthor: [],
      };
      useQuery.mockReturnValue(makeMainQuery({ data: mockData }));
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.totalWorksByStatus).toEqual([{ status: "PUBLISHED", count: 10 }]);
    });

    test("returns totalPublishedWorksByLabel from mainQuery.data", () => {
      const mockData = {
        totalWorksByStatus: [],
        totalPublishedWorksByLabel: [{ label: "Tech", count: 5 }],
        totalPublishedWorksByAuthor: [],
      };
      useQuery.mockReturnValue(makeMainQuery({ data: mockData }));
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.totalPublishedWorksByLabel).toEqual([{ label: "Tech", count: 5 }]);
    });

    test("returns totalPublishedWorksByAuthor from mainQuery.data", () => {
      const mockData = {
        totalWorksByStatus: [],
        totalPublishedWorksByLabel: [],
        totalPublishedWorksByAuthor: [{ author: "Alice", count: 3 }],
      };
      useQuery.mockReturnValue(makeMainQuery({ data: mockData }));
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.totalPublishedWorksByAuthor).toEqual([{ author: "Alice", count: 3 }]);
    });

    test("returns empty arrays when mainQuery.data is undefined", () => {
      useQuery.mockReturnValue(makeMainQuery({ data: undefined }));
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.totalWorksByStatus).toEqual([]);
      expect(result.current.totalPublishedWorksByLabel).toEqual([]);
      expect(result.current.totalPublishedWorksByAuthor).toEqual([]);
    });
  });

  describe('activeDetailView "labels" branch', () => {
    test("detailedStats comes from labelsQuery.data when activeDetailView is labels", () => {
      const labelsData = { list: [{ id: 1, name: "Tech" }], total: 1 };
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery({ data: labelsData }),
        makeDetailQuery({ data: { list: [] } }),
      ]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.detailedStats).toBe(labelsData);
    });

    test("isDetailedLoading comes from labelsQuery.isLoading when activeDetailView is labels", () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery({ isLoading: true }),
        makeDetailQuery({ isLoading: false }),
      ]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.isDetailedLoading).toBe(true);
    });

    test("detailedList comes from labelsQuery.data.list when activeDetailView is labels", () => {
      const labelsList = [{ id: 1 }, { id: 2 }];
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery({ data: { list: labelsList } }),
        makeDetailQuery(),
      ]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.detailedList).toEqual(labelsList);
    });

    test("detailedList is [] when labelsQuery.data has no list property", () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery({ data: {} }),
        makeDetailQuery(),
      ]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.detailedList).toEqual([]);
    });

    test("detailedList is [] when labelsQuery.data is undefined", () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery({ data: undefined }),
        makeDetailQuery(),
      ]);

      const { result } = renderHook(() => useDashboard("labels"));

      expect(result.current.detailedList).toEqual([]);
    });
  });

  describe('activeDetailView "authors" branch', () => {
    test("detailedStats comes from authorsQuery.data when activeDetailView is authors", () => {
      const authorsData = { list: [{ id: 10, name: "Alice" }], total: 1 };
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery({ data: { list: [] } }),
        makeDetailQuery({ data: authorsData }),
      ]);

      const { result } = renderHook(() => useDashboard("authors"));

      expect(result.current.detailedStats).toBe(authorsData);
    });

    test("isDetailedLoading comes from authorsQuery.isLoading when activeDetailView is authors", () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery({ isLoading: false }),
        makeDetailQuery({ isLoading: true }),
      ]);

      const { result } = renderHook(() => useDashboard("authors"));

      expect(result.current.isDetailedLoading).toBe(true);
    });

    test("detailedList comes from authorsQuery.data.list when activeDetailView is authors", () => {
      const authorsList = [{ id: 10 }, { id: 20 }];
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery(),
        makeDetailQuery({ data: { list: authorsList } }),
      ]);

      const { result } = renderHook(() => useDashboard("authors"));

      expect(result.current.detailedList).toEqual(authorsList);
    });

    test("detailedList is [] when authorsQuery.data has no list property", () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery(),
        makeDetailQuery({ data: {} }),
      ]);

      const { result } = renderHook(() => useDashboard("authors"));

      expect(result.current.detailedList).toEqual([]);
    });

    test("detailedList is [] when authorsQuery.data is undefined", () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([
        makeDetailQuery(),
        makeDetailQuery({ data: undefined }),
      ]);

      const { result } = renderHook(() => useDashboard("authors"));

      expect(result.current.detailedList).toEqual([]);
    });
  });

  describe("useQueries enabled flags", () => {
    test('labelsQuery is enabled only when activeDetailView is "labels"', () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      renderHook(() => useDashboard("labels"));

      const { queries } = useQueries.mock.calls[0][0];
      expect(queries[0].enabled).toBe(true);
      expect(queries[1].enabled).toBe(false);
    });

    test('authorsQuery is enabled only when activeDetailView is "authors"', () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      renderHook(() => useDashboard("authors"));

      const { queries } = useQueries.mock.calls[0][0];
      expect(queries[0].enabled).toBe(false);
      expect(queries[1].enabled).toBe(true);
    });

    test("neither query is enabled when activeDetailView is something else", () => {
      useQuery.mockReturnValue(makeMainQuery());
      useQueries.mockReturnValue([makeDetailQuery(), makeDetailQuery()]);

      renderHook(() => useDashboard("other"));

      const { queries } = useQueries.mock.calls[0][0];
      expect(queries[0].enabled).toBe(false);
      expect(queries[1].enabled).toBe(false);
    });
  });
});
