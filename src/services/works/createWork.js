import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";
import {
  mapStatusToBackend,
  mapWorkTypeToBackend,
  formatAuthorsForBackend,
  formatLabelsForBackend,
  formatLinksForBackend,
} from "../utils/utils";

export const createWork = async (workData, status = "draft") => {
  try {
    const { newAuthors } = formatAuthorsForBackend(workData.authors || []);
    const workLabels = formatLabelsForBackend(workData.labels || []);
    const workLinks = formatLinksForBackend(workData.links || []);
    const studentIds = workData.studentIds || [];

    const payload = {
      title: workData.title.trim(),
      description: workData.description?.trim() || "",
      content: workData.abstractText?.trim() || workData.abstract?.trim() || "",
      workType: mapWorkTypeToBackend(workData.workType),
      workStatus: mapStatusToBackend(status),
    };

    if (newAuthors.length > 0) {
      payload.newAuthors = newAuthors;
    }
    if (studentIds.length > 0) {
      payload.studentIds = studentIds;
    }
    if (workLabels.length > 0) {
      payload.workLabels = workLabels;
    }
    if (workLinks.length > 0) {
      payload.workLinks = workLinks;
    }

    const response = await api.post(ENDPOINTS.WORKS.CREATE, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};
