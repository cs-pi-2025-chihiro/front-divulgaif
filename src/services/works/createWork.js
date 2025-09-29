import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";
import {
  mapStatusToBackend,
  mapWorkTypeToBackend,
  formatAuthorsForBackend,
  formatLabelsForBackend,
  formatLinksForBackend,
} from "../utils/utils";
import { getStoredUser } from "../hooks/auth/useAuth";

export const createWork = async (workData, status = "draft") => {
  try {
    const currentUser = getStoredUser();
    const { newAuthors, studentIds: formattedStudentIds } = formatAuthorsForBackend(workData.authors || []);
    const workLabels = formatLabelsForBackend(workData.labels || []);
    const workLinks = formatLinksForBackend(workData.links || []);
    const studentIds = workData.studentIds || [];
    const allStudentIds = [...new Set([...studentIds, ...formattedStudentIds])];
    const principalLink = workLinks.length > 0 ? workLinks[0].url : "https://exemplo.com";
    if (!workData.title?.trim()) {
      throw new Error("Título é obrigatório");
    }
    if (!workData.description?.trim()) {
      throw new Error("Descrição é obrigatória");
    }
    if (!workData.workType) {
      throw new Error("Tipo de trabalho é obrigatório");
    }

    const payload = {
      title: workData.title.trim(),
      description: workData.description.trim(),
      content: workData.abstractText?.trim() || workData.description.trim(),
      workType: mapWorkTypeToBackend(workData.workType),
      workStatus: mapStatusToBackend(status),
      principalLink: principalLink,
      metaTag: workData.title.trim().toLowerCase().replace(/\s+/g, '-'),
      imageUrl: workData.imageUrl || "https://placehold.co/400x300?text=Sem+Imagem",
      teacherId: currentUser ? currentUser.id : 1,
    };

    if (newAuthors && newAuthors.length > 0) {
      payload.newAuthors = newAuthors;
    }
    if (allStudentIds.length > 0) {
      payload.studentIds = allStudentIds;
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
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Erro ao criar trabalho: ${error.message}`
      );
    }
  }
};