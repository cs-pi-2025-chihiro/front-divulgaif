import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "../../../../../enums/endpoints";
import api from "../../../../../services/utils/api";
import { WORK_TYPES } from "../../../../../enums/workTypes";
import { getWorkTypes } from "../../../../../services/utils/utils";
import { getStoredUser } from "../../../../../services/hooks/auth/useAuth";

const requestChanges = async ({ workId, requestData }) => {
  const response = await api.post(
    ENDPOINTS.WORKS.REQUEST_CHANGES + "/" + workId,
    requestData
  );
  return response.status === 200;
};

const publish = async ({ workId, evaluationData }) => {
  const response = await api.post(
    ENDPOINTS.WORKS.PUBLISH + "/" + workId,
    evaluationData
  );
  return response.status === 200;
};

export const useWorkEvaluation = () => {
  const requestChangesMutation = useMutation({
    mutationFn: requestChanges,
    mutationKey: [ENDPOINTS.WORKS.REQUEST_CHANGES],
  });

  const publishMutation = useMutation({
    mutationFn: publish,
    mutationKey: [ENDPOINTS.WORKS.PUBLISH],
  });

  const mapWorkTypeToBackend = (frontendWorkType, currentLang) => {
    const typeMap = {
      [getWorkTypes(WORK_TYPES.ARTICLE, currentLang)]: "ARTICLE",
      [getWorkTypes(WORK_TYPES.SEARCH, currentLang)]: "SEARCH",
      [getWorkTypes(WORK_TYPES.DISSERTATION, currentLang)]: "DISSERTATION",
      [getWorkTypes(WORK_TYPES.EXTENSION, currentLang)]: "EXTENSION",
      [getWorkTypes(WORK_TYPES.FINAL_THESIS, currentLang)]: "FINAL_THESIS",
    };
    return typeMap[frontendWorkType] || frontendWorkType;
  };

  const buildRequestChangesPayload = (formData, storedWork, currentLang) => {
    const payload = {
      feedbackMessage: formData.feedback || "",
    };

    if (formData.title !== storedWork?.title) {
      payload.title = formData.title;
    }

    if (formData.description !== storedWork?.description) {
      payload.description = formData.description;
    }

    if (formData.content !== storedWork?.content) {
      payload.content = formData.content;
    }

    if (formData.imageUrl !== storedWork?.imageUrl) {
      payload.imageUrl = formData.imageUrl;
    }

    const originalWorkType = storedWork?.workType?.name;
    const currentWorkTypeBackend = mapWorkTypeToBackend(
      formData.workType,
      currentLang
    );
    if (currentWorkTypeBackend !== originalWorkType) {
      payload.workType = currentWorkTypeBackend;
    }

    if (formData.authors && formData.authors.length > 0) {
      const existingAuthors = [];
      const newAuthors = [];

      formData.authors.forEach((author) => {
        if (author.id) {
          existingAuthors.push({ id: author.id });
        } else {
          newAuthors.push({
            name: author.name,
            email: author.email,
          });
        }
      });

      if (existingAuthors.length > 0) {
        payload.authors = existingAuthors;
      }

      if (newAuthors.length > 0) {
        payload.newAuthors = newAuthors;
      }
    }

    if (formData.labels && formData.labels.length > 0) {
      payload.workLabels = formData.labels.map((label) => ({
        name:
          typeof label === "string"
            ? label
            : label.name || label.title || String(label),
        color: "#4a7c59",
      }));
    }

    if (formData.links && formData.links.length > 0) {
      payload.workLinks = formData.links.map((link) => ({
        name: "",
        url: typeof link === "string" ? link : link.url,
        description: "",
      }));
    }

    return payload;
  };

  return {
    requestChanges: requestChangesMutation.mutate,
    requestChangesAsync: requestChangesMutation.mutateAsync,
    publish: publishMutation.mutate,
    publishAsync: publishMutation.mutateAsync,

    requestChangesWithData: (workId, formData, storedWork, currentLang) => {
      const requestData = buildRequestChangesPayload(
        formData,
        storedWork,
        currentLang
      );
      return requestChangesMutation.mutateAsync({ workId, requestData });
    },

    publishWork: (workId, evaluationData = {}) => {
      return publishMutation.mutateAsync({ workId, evaluationData });
    },

    isRequestChangesLoading: requestChangesMutation.isPending,
    isPublishLoading: publishMutation.isPending,
    requestChangesError: requestChangesMutation.error,
    publishError: publishMutation.error,

    buildRequestChangesPayload,
    mapWorkTypeToBackend,
  };
};
