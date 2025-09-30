import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";
import {
  mapStatusToBackend,
  mapWorkTypeToBackend,
  formatAuthorsForBackend,
  formatLabelsForBackend,
  formatLinksForBackend,
} from "../utils/utils";

export const updateWork = async (workId, workData, status = "draft") => {
  const { newAuthors } = formatAuthorsForBackend(workData.authors || []);
  const workLabels = formatLabelsForBackend(workData.labels || []);
  const workLinks = formatLinksForBackend(workData.links || []);
  const studentIds = workData.studentIds || [];
  const principalLink =
    workLinks.length > 0 ? workLinks[0].url : "https://exemplo.com";

  const payload = {
    title: workData.title.trim(),
    description: workData.description?.trim() || "",
    content: workData.content?.trim() || workData.content?.trim() || "",
    workType: mapWorkTypeToBackend(workData.workType),
    workStatus: mapStatusToBackend(status),
    imageUrl: workData.imageUrl || undefined,
    principalLink,
  };

  if (newAuthors && newAuthors.length > 0) {
    payload.newAuthors = newAuthors;
  }
  if (studentIds && studentIds.length > 0) {
    payload.studentIds = studentIds;
  }
  if (workLabels && workLabels.length > 0) {
    payload.workLabels = workLabels;
  }
  if (workLinks && workLinks.length > 0) {
    payload.workLinks = workLinks;
  }

  const response = await api.put(
    ENDPOINTS.WORKS.UPDATE.replace("{id}", workId),
    payload
  );
  return response.data;
};
