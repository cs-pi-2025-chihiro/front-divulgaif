import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getWork } from "../services/works/get";

const useWorkStore = create(
  persist(
    (set, get) => ({
      // Current work data
      currentWork: null,

      // Loading states
      isLoading: false,
      error: null,

      // Actions
      setCurrentWork: (work) => {
        set({
          currentWork: work,
          error: null,
        });
      },

      clearCurrentWork: () => {
        set({
          currentWork: null,
          error: null,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      // Fetch work data and store it
      fetchAndSetWork: async (workId) => {
        const { currentWork } = get();

        // If we already have the work with the same ID, return it
        if (currentWork && currentWork.id === workId) {
          return currentWork;
        }

        try {
          set({ isLoading: true, error: null });
          const work = await getWork(workId);
          set({
            currentWork: work,
            isLoading: false,
            error: null,
          });
          return work;
        } catch (error) {
          set({
            error: error.message || "Failed to fetch work",
            isLoading: false,
          });
          throw error;
        }
      },

      // Get work for evaluation - this ensures we have the work data when navigating to evaluation
      getWorkForEvaluation: (workId) => {
        const { currentWork } = get();

        // If we have the current work and it matches the requested ID, return it
        if (currentWork && currentWork.id === workId) {
          return currentWork;
        }

        // Otherwise return null - the evaluation page should handle fetching
        return null;
      },

      // Update work data (useful for optimistic updates)
      updateCurrentWork: (updates) => {
        const { currentWork } = get();
        if (currentWork) {
          set({
            currentWork: { ...currentWork, ...updates },
          });
        }
      },

      // Helper to check if we have work data for a specific ID
      hasWorkData: (workId) => {
        const { currentWork } = get();
        return currentWork && currentWork.id === workId;
      },

      // Prepare work for evaluation (called before navigation)
      prepareWorkForEvaluation: (work) => {
        set({ currentWork: work });
      },
    }),
    {
      name: "work-storage", // localStorage key
      partialize: (state) => ({
        currentWork: state.currentWork,
      }), // Only persist the work data, not loading states
    }
  )
);

export default useWorkStore;
