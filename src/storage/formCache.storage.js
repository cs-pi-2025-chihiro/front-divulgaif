import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFormCacheStore = create(
  persist(
    (set, get) => ({
      cachedFormData: null,

      saveFormData: (formData) => {
        set({
          cachedFormData: {
            ...formData,
            cachedAt: new Date().toISOString(),
          },
        });
      },

      getCachedFormData: () => {
        const { cachedFormData } = get();
        return cachedFormData;
      },

      clearFormData: () => {
        set({
          cachedFormData: null,
        });
      },

      hasCachedData: () => {
        const { cachedFormData } = get();
        return cachedFormData !== null;
      },

      updateCachedField: (fieldName, value) => {
        const { cachedFormData } = get();
        if (cachedFormData) {
          set({
            cachedFormData: {
              ...cachedFormData,
              [fieldName]: value,
            },
          });
        }
      },
    }),
    {
      name: "form-cache-storage",
      partialize: (state) => ({
        cachedFormData: state.cachedFormData,
      }),
    }
  )
);

export default useFormCacheStore;
