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
        } else if (name) {
          newAuthors.push({ name, email: "" });
        }
      }
    });

    return { studentIds, newAuthors };
  };

  const formatLabelsForBackend = (labelsArray) => {
    return labelsArray.map((label) => {
      let labelName = "";

      if (typeof label === "string") {
        labelName = label;
      } else if (label && typeof label === "object") {
        labelName = label.label || label.name || String(label);
      } else {
        labelName = String(label);
      }

      return {
        name: labelName,
        color: (label && label.color) || "#007bff",
      };
    });
  };

  const formatLinksForBackend = (linksArray) => {
    return linksArray.map((link) => {
      let linkUrl = "";

      if (typeof link === "string") {
        linkUrl = link;
      } else if (link && typeof link === "object") {
        linkUrl = link.link || link.url || String(link);
      } else {
        linkUrl = String(link);
      }

      return {
        name: (link && link.name) || "Link",
        url: linkUrl,
        description: (link && link.description) || "",
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

      const simplePayload = {
        title: workData.title?.trim() || "",
        description: workData.description?.trim() || "",
        content: workData.abstract?.trim() || "",
        workType: mapWorkTypeToBackend(workData.workType),
        workStatus: mapStatusToBackend(status),
      };

      if (!simplePayload.title) {
        throw new Error("Título é obrigatório");
      }
      if (!simplePayload.workType) {
        throw new Error("Tipo de trabalho é obrigatório");
      }
      if (studentIds.length === 0 && newAuthors.length === 0) {
        throw new Error("Pelo menos um autor é obrigatório");
      }

      const response = await api.post(ENDPOINTS.WORKS.CREATE, simplePayload);
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
