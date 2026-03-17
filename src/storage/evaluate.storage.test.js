import useWorkStore from "./evaluate.storage";
import { getWork } from "../services/works/get";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../services/works/get", () => ({
  getWork: jest.fn(),
}));

// Zustand's persist middleware writes to localStorage. Provide a minimal stub
// so the store initialises correctly in the jsdom environment.
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reset every field of the store back to its initial value between tests. */
const resetStore = () => {
  useWorkStore.setState({
    currentWork: null,
    isLoading: false,
    error: null,
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useWorkStore (evaluate.storage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    resetStore();
  });

  // ── setCurrentWork ──────────────────────────────────────────────────────────

  describe("setCurrentWork", () => {
    it("sets currentWork and clears the error", () => {
      const work = { id: 1, title: "My Work" };
      // Pre-set an error to verify it is cleared.
      useWorkStore.setState({ error: "previous error" });

      useWorkStore.getState().setCurrentWork(work);

      const state = useWorkStore.getState();
      expect(state.currentWork).toEqual(work);
      expect(state.error).toBeNull();
    });

    it("replaces a previously stored work", () => {
      const first = { id: 1, title: "First" };
      const second = { id: 2, title: "Second" };

      useWorkStore.getState().setCurrentWork(first);
      useWorkStore.getState().setCurrentWork(second);

      expect(useWorkStore.getState().currentWork).toEqual(second);
    });
  });

  // ── clearCurrentWork ────────────────────────────────────────────────────────

  describe("clearCurrentWork", () => {
    it("sets currentWork to null and clears the error", () => {
      useWorkStore.setState({
        currentWork: { id: 1 },
        error: "some error",
      });

      useWorkStore.getState().clearCurrentWork();

      const state = useWorkStore.getState();
      expect(state.currentWork).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  // ── setLoading ──────────────────────────────────────────────────────────────

  describe("setLoading", () => {
    it("sets isLoading to true", () => {
      useWorkStore.getState().setLoading(true);
      expect(useWorkStore.getState().isLoading).toBe(true);
    });

    it("sets isLoading to false", () => {
      useWorkStore.setState({ isLoading: true });
      useWorkStore.getState().setLoading(false);
      expect(useWorkStore.getState().isLoading).toBe(false);
    });
  });

  // ── setError ────────────────────────────────────────────────────────────────

  describe("setError", () => {
    it("stores the provided error message", () => {
      useWorkStore.getState().setError("Something went wrong");
      expect(useWorkStore.getState().error).toBe("Something went wrong");
    });

    it("can clear the error by setting null", () => {
      useWorkStore.setState({ error: "existing error" });
      useWorkStore.getState().setError(null);
      expect(useWorkStore.getState().error).toBeNull();
    });
  });

  // ── fetchAndSetWork ─────────────────────────────────────────────────────────

  describe("fetchAndSetWork", () => {
    it("fetches the work and stores it when no cached work matches", async () => {
      const mockWork = { id: 42, title: "Fetched Work" };
      getWork.mockResolvedValue(mockWork);

      const result = await useWorkStore.getState().fetchAndSetWork(42);

      expect(getWork).toHaveBeenCalledWith(42);
      expect(result).toEqual(mockWork);

      const state = useWorkStore.getState();
      expect(state.currentWork).toEqual(mockWork);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("sets isLoading to true while fetching and false afterwards", async () => {
      let resolveWork;
      const workPromise = new Promise((resolve) => {
        resolveWork = resolve;
      });
      getWork.mockReturnValue(workPromise);

      const fetchPromise = useWorkStore.getState().fetchAndSetWork(10);
      expect(useWorkStore.getState().isLoading).toBe(true);

      resolveWork({ id: 10, title: "Work" });
      await fetchPromise;

      expect(useWorkStore.getState().isLoading).toBe(false);
    });

    it("returns the cached work immediately without calling getWork", async () => {
      const cachedWork = { id: 5, title: "Cached" };
      useWorkStore.setState({ currentWork: cachedWork });

      const result = await useWorkStore.getState().fetchAndSetWork(5);

      expect(getWork).not.toHaveBeenCalled();
      expect(result).toEqual(cachedWork);
    });

    it("fetches from API when cached work has a different id", async () => {
      const cachedWork = { id: 1, title: "Old Work" };
      useWorkStore.setState({ currentWork: cachedWork });

      const newWork = { id: 2, title: "New Work" };
      getWork.mockResolvedValue(newWork);

      const result = await useWorkStore.getState().fetchAndSetWork(2);

      expect(getWork).toHaveBeenCalledWith(2);
      expect(result).toEqual(newWork);
    });

    it("sets error state and rethrows when getWork fails", async () => {
      const fetchError = new Error("Network failure");
      getWork.mockRejectedValue(fetchError);

      await expect(
        useWorkStore.getState().fetchAndSetWork(99)
      ).rejects.toThrow("Network failure");

      const state = useWorkStore.getState();
      expect(state.error).toBe("Network failure");
      expect(state.isLoading).toBe(false);
    });

    it("uses 'Failed to fetch work' when the error has no message", async () => {
      getWork.mockRejectedValue({});

      await expect(
        useWorkStore.getState().fetchAndSetWork(99)
      ).rejects.toEqual({});

      expect(useWorkStore.getState().error).toBe("Failed to fetch work");
    });
  });

  // ── getWorkForEvaluation ────────────────────────────────────────────────────

  describe("getWorkForEvaluation", () => {
    it("returns the current work when its id matches", () => {
      const work = { id: 7, title: "Work 7" };
      useWorkStore.setState({ currentWork: work });

      const result = useWorkStore.getState().getWorkForEvaluation(7);
      expect(result).toEqual(work);
    });

    it("returns null when no work is cached", () => {
      const result = useWorkStore.getState().getWorkForEvaluation(7);
      expect(result).toBeNull();
    });

    it("returns null when the cached work has a different id", () => {
      useWorkStore.setState({ currentWork: { id: 3, title: "Other" } });
      const result = useWorkStore.getState().getWorkForEvaluation(7);
      expect(result).toBeNull();
    });
  });

  // ── updateCurrentWork ───────────────────────────────────────────────────────

  describe("updateCurrentWork", () => {
    it("merges the provided updates into the current work", () => {
      useWorkStore.setState({
        currentWork: { id: 1, title: "Original", status: "draft" },
      });

      useWorkStore.getState().updateCurrentWork({ status: "published" });

      expect(useWorkStore.getState().currentWork).toEqual({
        id: 1,
        title: "Original",
        status: "published",
      });
    });

    it("adds new fields to the current work", () => {
      useWorkStore.setState({ currentWork: { id: 1, title: "Work" } });

      useWorkStore.getState().updateCurrentWork({ score: 95 });

      expect(useWorkStore.getState().currentWork.score).toBe(95);
    });

    it("does nothing when currentWork is null", () => {
      expect(useWorkStore.getState().currentWork).toBeNull();
      useWorkStore.getState().updateCurrentWork({ title: "New Title" });
      expect(useWorkStore.getState().currentWork).toBeNull();
    });
  });

  // ── hasWorkData ─────────────────────────────────────────────────────────────

  describe("hasWorkData", () => {
    it("returns true when the cached work id matches", () => {
      useWorkStore.setState({ currentWork: { id: 10 } });
      expect(useWorkStore.getState().hasWorkData(10)).toBe(true);
    });

    it("returns false when no work is cached", () => {
      expect(useWorkStore.getState().hasWorkData(10)).toBeFalsy();
    });

    it("returns false when the cached work has a different id", () => {
      useWorkStore.setState({ currentWork: { id: 5 } });
      expect(useWorkStore.getState().hasWorkData(10)).toBeFalsy();
    });
  });

  // ── prepareWorkForEvaluation ────────────────────────────────────────────────

  describe("prepareWorkForEvaluation", () => {
    it("sets currentWork to the provided work object", () => {
      const work = { id: 20, title: "Evaluation Work" };
      useWorkStore.getState().prepareWorkForEvaluation(work);
      expect(useWorkStore.getState().currentWork).toEqual(work);
    });

    it("overwrites any previously stored work", () => {
      useWorkStore.setState({ currentWork: { id: 1, title: "Old" } });
      const newWork = { id: 2, title: "New" };
      useWorkStore.getState().prepareWorkForEvaluation(newWork);
      expect(useWorkStore.getState().currentWork).toEqual(newWork);
    });

    it("does not modify isLoading or error fields", () => {
      useWorkStore.setState({ isLoading: true, error: "existing error" });
      useWorkStore.getState().prepareWorkForEvaluation({ id: 3 });
      const state = useWorkStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe("existing error");
    });
  });
});
