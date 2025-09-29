import { useState } from "react";
import { updateWork } from "../../../services/works/updateWork";
import { WORK_STATUS } from "../../../enums/workStatus";

export const useUpdateWork = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdateWork = async (
    workId,
    workData,
    status = WORK_STATUS.DRAFT
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateWork(workId, workData, status);
      return result;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError(error.message || "An unexpected error occurred.");
      }
      console.log("error: ", error);
      throw error;
    }
  };

  const saveDraft = (workId, workData) =>
    handleUpdateWork(workId, workData, WORK_STATUS.DRAFT);
  const submitForReview = (workId, workData) =>
    handleUpdateWork(workId, workData, WORK_STATUS.SUBMITTED);

  return {
    isLoading,
    error,
    updateWork: handleUpdateWork,
    saveDraft,
    submitForReview,
  };
};
