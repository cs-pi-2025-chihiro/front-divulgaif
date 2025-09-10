import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getWork } from "../services/works/get";

const useWorkStore = create(
  persist(
    (set, get) => ({
      currentWork: null,
      isLoading: false,
      error: null,
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

      fetchAndSetWork: async (workId) => {
        const { currentWork } = get();

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

      getWorkForEvaluation: (workId) => {
        const { currentWork } = get();

        if (currentWork && currentWork.id === workId) {
          return currentWork;
        }

        return null;
      },

      updateCurrentWork: (updates) => {
        const { currentWork } = get();
        if (currentWork) {
          set({
            currentWork: { ...currentWork, ...updates },
          });
        }
      },

      hasWorkData: (workId) => {
        const { currentWork } = get();
        return currentWork && currentWork.id === workId;
      },

      prepareWorkForEvaluation: (work) => {
        set({ currentWork: work });
      },
    }),
    {
      name: "work-storage",
      partialize: (state) => ({
        currentWork: state.currentWork,
      }),
    }
  )
);

export default useWorkStore;
