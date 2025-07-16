import { useState } from "react";
import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const useCreateWork = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapStatusToBackend = (status) => {
    const statusMap = {
      draft: "DRAFT",
      under_review: "SUBMITTED",
      published: "PUBLISHED",
    };
    return statusMap[status] || "DRAFT";
  };

  const mapWorkTypeToBackend = (workType) => {
    const typeMap = {
      Artigo: "ARTICLE",
      Pesquisa: "SEARCH",
      Dissertação: "DISSERTATION",
      Extensão: "EXTENSION",
      TCC: "FINAL_THESIS",
    };
    return typeMap[workType] || workType;
  };

  const formatAuthorsForBackend = (authorsArray) => {
    const studentIds = [];
    const newAuthors = [];

    authorsArray.forEach((author) => {
      if (typeof author === "object" && author.id) {
        studentIds.push(author.id);
      } else {
        const authorStr =
          typeof author === "string" ? author : author.name || "";
        const [name, email] = authorStr.includes("@")
          ? authorStr.split(" <").map((part) => part.replace(">", "").trim())
          : [authorStr, ""];

        if (name && email) {
          newAuthors.push({ name, email });
        }
      }
    });

    return { studentIds, newAuthors };
  };

  const formatLabelsForBackend = (labelsArray) => {
    return labelsArray.map((label) => {
      if (typeof label === "string") {
        return {
          name: label,
          color: "#007bff",
        };
      }
      return {
        name: label.name || label,
        color: label.color || "#007bff",
      };
    });
  };

  const formatLinksForBackend = (linksArray) => {
    return linksArray.map((link) => {
      if (typeof link === "string") {
        return {
          name: "Link",
          url: link,
          description: "",
        };
      }
      return {
        name: link.name || "Link",
        url: link.url || link,
        description: link.description || "",
      };
    });
  };

  const createWork = async (workData, status = "draft") => {
    setIsLoading(true);
    setError(null);

    try {
      const { studentIds, newAuthors } = formatAuthorsForBackend(
        workData.authors || []
      );
      const workLabels = formatLabelsForBackend(workData.labels || []);
      const workLinks = formatLinksForBackend(workData.links || []);

      const formData = new FormData();
      formData.append("title", workData.title || "");
      formData.append("description", workData.description || "");
      formData.append("abstract", workData.abstract || "");
      formData.append("workType", mapWorkTypeToBackend(workData.workType));
      formData.append("workStatus", mapStatusToBackend(status));

      if (workData.image) {
        formData.append("image", workData.image);
      }

      formData.append("studentIds", JSON.stringify(studentIds));
      formData.append("newAuthors", JSON.stringify(newAuthors));
      formData.append("workLabels", JSON.stringify(workLabels));
      formData.append("workLinks", JSON.stringify(workLinks));

      const response = await api.post(ENDPOINTS.WORKS.CREATE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao criar trabalho:", error);

      let errorMessage = "Erro ao criar trabalho. Tente novamente.";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage =
            data.message ||
            "Dados inválidos. Verifique os campos obrigatórios.";
        } else if (status === 401) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        } else if (status === 403) {
          errorMessage = "Você não tem permissão para realizar esta ação.";
        } else if (status === 413) {
          errorMessage = "Arquivo muito grande. Reduza o tamanho da imagem.";
        } else if (status >= 500) {
          errorMessage =
            "Erro interno do servidor. Tente novamente mais tarde.";
        }
      } else if (error.request) {
        errorMessage =
          "Erro de conexão. Verifique sua internet e tente novamente.";
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = (workData) => createWork(workData, "draft");
  const submitForReview = (workData) => createWork(workData, "under_review");
  const publish = (workData) => createWork(workData, "published");

  return {
    isLoading,
    error,
    createWork,
    saveDraft,
    submitForReview,
    publish,
  };
};
