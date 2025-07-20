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
      submitted: "SUBMITTED",
      published: "PUBLISHED",
      pending_changes: "PENDING_CHANGES",
      rejected: "REJECTED",
    };
    return statusMap[status] || "DRAFT";
  };

  const mapWorkTypeToBackend = (workType) => {
    const typeMap = {
      ARTICLE: "ARTICLE",
      RESEARCH: "SEARCH",
      DISSERTATION: "DISSERTATION",
      EXTENSION: "EXTENSION",
      FINAL_PAPER: "FINAL_THESIS",
    };
    return typeMap[workType] || workType;
  };

  const formatAuthorsForBackend = (authorsArray) => {
    const newAuthors = [];

    authorsArray.forEach((author) => {
      let name = "";
      let email = "";

      if (typeof author === "string") {
        if (author.includes("<") && author.includes(">")) {
          const match = author.match(/^(.+?)\s*<(.+?)>$/);
          if (match) {
            name = match[1].trim();
            email = match[2].trim();
          } else {
            name = author.trim();
          }
        } else if (author.includes("@")) {
          name = author.split("@")[0].trim();
          email = author.trim();
        } else {
          name = author.trim();
        }
      } else if (typeof author === "object") {
        name = author.name || author.label || "";
        email = author.email || "";
      }

      if (name) {
        if (!email || !isValidEmail(email)) {
          email = `${name.toLowerCase().replace(/\s+/g, ".")}@external.com`;
        }
        newAuthors.push({ name, email });
      }
    });

    return { newAuthors };
  };

  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formatLabelsForBackend = (labelsArray) => {
    return labelsArray.map((label) => {
      const labelName =
        typeof label === "string"
          ? label
          : label && typeof label === "object"
          ? label.label || label.name || String(label)
          : String(label);

      const labelColor = (label && label.color) || "#3B82F6";

      const colorHex = labelColor.startsWith("#")
        ? labelColor
        : `#${labelColor}`;

      return {
        name: labelName,
        color: colorHex,
      };
    });
  };

  const formatLinksForBackend = (linksArray) => {
    return linksArray.map((link) => {
      let linkUrl, linkName, linkDescription;

      if (typeof link === "string") {
        linkUrl = link;
        linkName = link;
        linkDescription = "";
      } else if (link && typeof link === "object") {
        linkUrl = link.url || link.link || link.name || String(link);
        linkName = link.name || link.label || linkUrl;
        linkDescription = link.description || "";
      } else {
        linkUrl = String(link);
        linkName = String(link);
        linkDescription = "";
      }

      if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
        linkUrl = `https://${linkUrl}`;
      }

      return {
        name: linkName || "Link",
        url: linkUrl,
        description: linkDescription,
      };
    });
  };

  const createWork = async (workData, status = "draft") => {
    setIsLoading(true);
    setError(null);

    try {
      if (!workData.title?.trim()) {
        throw new Error("Título é obrigatório");
      }
      if (!workData.workType) {
        throw new Error("Tipo de trabalho é obrigatório");
      }

      const { newAuthors } = formatAuthorsForBackend(workData.authors || []);
      const workLabels = formatLabelsForBackend(workData.labels || []);
      const workLinks = formatLinksForBackend(workData.links || []);

      const payload = {
        title: workData.title.trim(),
        description: workData.description?.trim() || "",
        content:
          workData.abstractText?.trim() || workData.abstract?.trim() || "",
        workType: mapWorkTypeToBackend(workData.workType),
        workStatus: mapStatusToBackend(status),
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
      console.log("error: 1 ", error);
      const status = error.response?.status;
      const data = error.response?.data;
      let errorMessage = "Erro ao criar trabalho. Tente novamente.";

      if (error.response) {
        if (status === 400) {
          errorMessage =
            data.message ||
            data.error ||
            "Dados inválidos. Verifique os campos obrigatórios.";
        } else if (status === 401) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        } else if (status === 403) {
          errorMessage = "Você não tem permissão para realizar esta ação.";
        } else if (status === 404) {
          if (data.error && data.error.includes("User with id")) {
            errorMessage =
              "Erro interno: usuário não encontrado. Todos os autores serão criados como novos usuários.";
          } else if (data.error && data.error.includes("WorkType")) {
            errorMessage =
              "Tipo de trabalho inválido. Verifique se o tipo selecionado é válido.";
          } else {
            errorMessage =
              "Recurso não encontrado. Verifique os dados enviados.";
          }
        } else if (status >= 500) {
          errorMessage =
            "Erro interno do servidor. Tente novamente mais tarde.";
        }

        if (data.details || data.errors) {
          const details = data.details || data.errors;
          if (typeof details === "object") {
            const errorDetails = Object.values(details).flat().join(", ");
            errorMessage += ` Detalhes: ${errorDetails}`;
          }
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
