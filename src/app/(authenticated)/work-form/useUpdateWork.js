import { useState } from "react";
import { updateWork } from "../../../services/works/updateWork";

export const useUpdateWork = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdateWork = async (workId, workData, status = "draft") => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateWork(workId, workData, status);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = (workId, workData) => handleUpdateWork(workId, workData, "draft");
  const submitForReview = (workId, workData) => handleUpdateWork(workId, workData, "under_review");

  return {
    isLoading,
    error,
    updateWork: handleUpdateWork,
    saveDraft,
    submitForReview,
  };
};
