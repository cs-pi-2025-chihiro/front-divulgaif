import useFormCacheStore from "./formCache.storage";

describe("formCache.storage (Zustand store)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    useFormCacheStore.setState({ cachedFormData: null });
  });

  describe("initial state", () => {
    test("cachedFormData is null initially", () => {
      const state = useFormCacheStore.getState();
      expect(state.cachedFormData).toBeNull();
    });
  });

  describe("saveFormData", () => {
    test("saves form data into the store", () => {
      const { saveFormData } = useFormCacheStore.getState();
      saveFormData({ title: "My Work", workType: "ARTICLE" });

      const { cachedFormData } = useFormCacheStore.getState();
      expect(cachedFormData.title).toBe("My Work");
      expect(cachedFormData.workType).toBe("ARTICLE");
    });

    test("adds cachedAt timestamp when saving", () => {
      const { saveFormData } = useFormCacheStore.getState();
      saveFormData({ title: "Test" });

      const { cachedFormData } = useFormCacheStore.getState();
      expect(cachedFormData.cachedAt).toBeDefined();
      expect(typeof cachedFormData.cachedAt).toBe("string");
    });

    test("cachedAt is a valid ISO date string", () => {
      const { saveFormData } = useFormCacheStore.getState();
      saveFormData({ title: "Test" });

      const { cachedFormData } = useFormCacheStore.getState();
      expect(new Date(cachedFormData.cachedAt).toISOString()).toBe(
        cachedFormData.cachedAt
      );
    });

    test("overwrites previously saved data", () => {
      const { saveFormData } = useFormCacheStore.getState();
      saveFormData({ title: "First" });
      saveFormData({ title: "Second" });

      const { cachedFormData } = useFormCacheStore.getState();
      expect(cachedFormData.title).toBe("Second");
    });
  });

  describe("getCachedFormData", () => {
    test("returns null when no data is cached", () => {
      const { getCachedFormData } = useFormCacheStore.getState();
      expect(getCachedFormData()).toBeNull();
    });

    test("returns the cached data after saving", () => {
      const { saveFormData, getCachedFormData } = useFormCacheStore.getState();
      saveFormData({ title: "My Work" });

      const cached = getCachedFormData();
      expect(cached.title).toBe("My Work");
    });
  });

  describe("clearFormData", () => {
    test("sets cachedFormData to null", () => {
      const { saveFormData, clearFormData } = useFormCacheStore.getState();
      saveFormData({ title: "Something" });
      clearFormData();

      const { cachedFormData } = useFormCacheStore.getState();
      expect(cachedFormData).toBeNull();
    });

    test("clearing already-null data does not throw", () => {
      const { clearFormData } = useFormCacheStore.getState();
      expect(() => clearFormData()).not.toThrow();
    });
  });

  describe("hasCachedData", () => {
    test("returns false when cachedFormData is null", () => {
      const { hasCachedData } = useFormCacheStore.getState();
      expect(hasCachedData()).toBe(false);
    });

    test("returns true after data is saved", () => {
      const { saveFormData, hasCachedData } = useFormCacheStore.getState();
      saveFormData({ title: "Test" });
      expect(hasCachedData()).toBe(true);
    });

    test("returns false after data is cleared", () => {
      const { saveFormData, clearFormData, hasCachedData } =
        useFormCacheStore.getState();
      saveFormData({ title: "Test" });
      clearFormData();
      expect(hasCachedData()).toBe(false);
    });
  });

  describe("updateCachedField", () => {
    test("updates a specific field in cached data", () => {
      const { saveFormData, updateCachedField } = useFormCacheStore.getState();
      saveFormData({ title: "Original", workType: "ARTICLE" });
      updateCachedField("title", "Updated");

      const { cachedFormData } = useFormCacheStore.getState();
      expect(cachedFormData.title).toBe("Updated");
      expect(cachedFormData.workType).toBe("ARTICLE");
    });

    test("does nothing when cachedFormData is null", () => {
      const { updateCachedField } = useFormCacheStore.getState();
      expect(() => updateCachedField("title", "Value")).not.toThrow();

      const { cachedFormData } = useFormCacheStore.getState();
      expect(cachedFormData).toBeNull();
    });

    test("adds a new field to cached data", () => {
      const { saveFormData, updateCachedField } = useFormCacheStore.getState();
      saveFormData({ title: "Test" });
      updateCachedField("description", "New description");

      const { cachedFormData } = useFormCacheStore.getState();
      expect(cachedFormData.description).toBe("New description");
    });

    test("preserves other fields when updating one", () => {
      const { saveFormData, updateCachedField } = useFormCacheStore.getState();
      saveFormData({ title: "Test", workType: "ARTICLE", description: "Desc" });
      updateCachedField("title", "New Title");

      const { cachedFormData } = useFormCacheStore.getState();
      expect(cachedFormData.workType).toBe("ARTICLE");
      expect(cachedFormData.description).toBe("Desc");
    });
  });
});
