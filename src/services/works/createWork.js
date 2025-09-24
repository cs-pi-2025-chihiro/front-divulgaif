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
    const principalLink = workLinks.length > 0 ? workLinks[0].url : "https://exemplo.com";
    const payload = {
      title: workData.title.trim(),
      description: workData.description?.trim() || "",
      content: workData.abstractText?.trim() || workData.abstract?.trim() || "",
      workType: mapWorkTypeToBackend(workData.workType),
      workStatus: mapStatusToBackend(status),
      principalLink: principalLink,
      metaTag: workData.title?.trim()?.toLowerCase().replace(/\s+/g, '-') || "trabalho",
      imageUrl: workData.imageUrl || "https://placehold.co/400x300?text=Sem+Imagem",
      teacherId: currentUser.id || 1,
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
    if (error.response?.status === 401) throw error;
    else {
      throw new Error(
        error.response?.data?.error ||
          "An error occurred while creating the work"
      );
    }
  }
};
