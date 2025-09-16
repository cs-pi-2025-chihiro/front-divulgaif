import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";
import { 
  mapStatusToBackend, 
  mapWorkTypeToBackend, 
  formatAuthorsForBackend, 
  formatLabelsForBackend, 
  formatLinksForBackend 
} from "../utils/utils";

export const createWork = async (workData, status = "draft") => {
  try {
    if (!workData.title?.trim()) {
      throw new Error("Title is required");
    }
    if (!workData.workType) {
      throw new Error("Work type is required");
    }
    const currentUser = JSON.parse(localStorage.getItem("userData") || "{}");
    
    if (!currentUser.id) {
      throw new Error("User not authenticated properly. Please login again.");
    }

    const { newAuthors } = formatAuthorsForBackend(workData.authors || []);
    const workLabels = formatLabelsForBackend(workData.labels || []);
    const workLinks = formatLinksForBackend(workData.links || []);
    const principalLink = workLinks.length > 0 ? workLinks[0].url : "https://exemplo.com";
    const payload = {
      title: workData.title.trim(),
      description: workData.description?.trim() || workData.title?.trim() || "Descrição do trabalho",
      content: workData.abstractText?.trim() || workData.abstract?.trim() || workData.description?.trim() || "Conteúdo do trabalho",
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
    if (workLabels.length > 0) {
      payload.workLabels = workLabels;
    }
    if (workLinks.length > 0) {
      payload.workLinks = workLinks;
    }

    const response = await api.post(ENDPOINTS.WORKS.CREATE, payload);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    let errorMessage = "Error creating work. Please try again.";

    if (error.response) {
      if (status === 400) {
        errorMessage =
          data.message ||
          data.error ||
          "Invalid data. Please check required fields.";
      } else if (status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (status === 404) {
        if (data.error && data.error.includes("User with id")) {
          errorMessage =
            "Internal error: user not found. All authors will be created as new users.";
        } else if (data.error && data.error.includes("WorkType")) {
          errorMessage =
            "Invalid work type. Please check if the selected type is valid.";
        } else {
          errorMessage =
            "Resource not found. Please check the submitted data.";
        }
      } else if (status >= 500) {
        errorMessage =
          "Internal server error. Please try again later.";
      }

      if (data.details || data.errors) {
        const details = data.details || data.errors;
        if (typeof details === "object") {
          const errorDetails = Object.values(details).flat().join(", ");
          errorMessage += ` Details: ${errorDetails}`;
        }
      }
    } else if (error.request) {
      errorMessage =
        "Connection error. Please check your internet and try again.";
    }

    throw new Error(errorMessage);
  }
};
