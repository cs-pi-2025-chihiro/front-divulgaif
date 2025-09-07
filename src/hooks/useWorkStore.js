import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useWorkStore from "../storage/work.storage";
import { navigateTo } from "../services/utils/utils";

export const useWorkNavigation = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { prepareWorkForEvaluation } = useWorkStore();

  const navigateToWorkEvaluation = useCallback(
    (work) => {
      prepareWorkForEvaluation(work);

      const currentLang = i18n.language;
      const evaluateWorkPath =
        currentLang === "pt"
          ? `avaliar-trabalho/${work.id}`
          : `rate-work/${work.id}`;

      navigateTo(evaluateWorkPath, navigate, currentLang);
    },
    [prepareWorkForEvaluation, navigate, i18n.language]
  );

  return {
    navigateToWorkEvaluation,
  };
};

export const useWorkData = (workId) => {
  const {
    currentWork,
    isLoading,
    error,
    fetchAndSetWork,
    getWorkForEvaluation,
    hasWorkData,
    updateCurrentWork,
    clearCurrentWork,
  } = useWorkStore();

  const workData = getWorkForEvaluation(workId);
  const hasData = hasWorkData(workId);

  const loadWork = useCallback(async () => {
    if (workId && !hasData) {
      try {
        return await fetchAndSetWork(workId);
      } catch (error) {
        console.error("Failed to load work:", error);
        throw error;
      }
    }
    return workData;
  }, [workId, hasData, fetchAndSetWork, workData]);

  return {
    workData,
    hasData,
    isLoading,
    error,
    loadWork,
    updateWork: updateCurrentWork,
    clearWork: clearCurrentWork,
  };
};
