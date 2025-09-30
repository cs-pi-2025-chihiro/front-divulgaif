import { useState } from "react";
import { createWork } from "../../../services/works/createWork";
import { WORK_STATUS } from "../../../enums/workStatus";

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
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = (workData) => handleCreateWork(workData, WORK_STATUS.DRAFT);
  const submitForReview = (workData) =>
    handleCreateWork(workData, WORK_STATUS.SUBMITTED);
  const publish = (workData) =>
    handleCreateWork(workData, WORK_STATUS.PUBLISHED);

  return {
    isLoading,
    error,
    createWork: handleCreateWork,
    saveDraft,
    submitForReview,
    publish,
  };
};
