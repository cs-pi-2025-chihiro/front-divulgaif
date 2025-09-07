import { useState } from "react";
import { createWork } from "../../../services/works/createWork";

export const useCreateWork = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateWork = async (workData, status = "draft") => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createWork(workData, status);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = (workData) => handleCreateWork(workData, "draft");
  const submitForReview = (workData) => handleCreateWork(workData, "under_review");
  const publish = (workData) => handleCreateWork(workData, "published");

  return {
    isLoading,
    error,
    createWork: handleCreateWork,
    saveDraft,
    submitForReview,
    publish,
  };
};
