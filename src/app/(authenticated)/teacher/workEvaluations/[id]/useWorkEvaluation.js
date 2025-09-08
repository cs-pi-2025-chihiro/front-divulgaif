import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "../../../../../enums/endpoints";
import api from "../../../services/utils/api";

const editWork = async (workId, workData) => {
  const response = await api.put(`/works/${workId}`, workData);
  return response.data;
};

const createHistory = async (workId, evaluationData) => {
  const response = await api.put(`/works/${workId}`, evaluationData);
  return response.data;
};

export const useWorkEvaluation = () => {
  const editMutation = useMutation({
    mutationFn: editWork,
    mutationKey: [ENDPOINTS.WORKS.EDIT],
  });

  const createHistoryMutation = useMutation({
    mutationFn: createHistory,
    mutationKey: [ENDPOINTS.HISTORY.CREATE],
  });

  return {
    editWork: editMutation.mutate,
    createHistory: createHistoryMutation.mutate,
  };
};
