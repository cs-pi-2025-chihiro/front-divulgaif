import { ROLES } from "../../enums/roles";
import { hasRole } from "../hooks/auth/useAuth";

export function mapPaginationValues(value, setSize) {
  switch (value) {
    case "eight":
      setSize(8);
      break;
    case "twelve":
      setSize(12);
      break;
    case "twentyfour":
      setSize(24);
      break;
    case "thirtysix":
      setSize(36);
      break;
  }
}

export function navigateTo(path, navigate, currentLang = "pt") {
  console.log("Navigating to:", path, "with language:", currentLang);
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const fullPath = cleanPath
    ? `/${currentLang}/${cleanPath}`
    : `/${currentLang}`;
  navigate(fullPath);
}

export const getStatusColor = (status) => {
  switch (status) {
    case "Aprovado":
      return "status-aprovado";
    case "Enviado":
      return "status-enviado";
    case "Rascunho":
      return "status-rascunho";
    case "Rejeitado":
      return "status-rejeitado";
    default:
      return "status-default";
  }
};

export const getWorkTypes = (type, currentLang) => {
  switch (type) {
    case "ARTICLE":
      return currentLang === "pt" ? "Artigo" : "Article";
    case "SEARCH":
      return currentLang === "pt" ? "Pesquisa" : "Search";
    case "DISSERTATION":
      return currentLang === "pt" ? "Dissertação" : "Dissertation";
    case "EXTENSION":
      return currentLang === "pt" ? "Extensão" : "Extension";
    case "FINAL_THESIS":
      return currentLang === "pt" ? "TCC" : "Final Thesis";
    case "OTHER":
      return currentLang === "pt" ? "Projeto" : "Project";
    default:
      return currentLang === "pt" ? "Desconhecido" : "Unknown";
  }
};

export const getWorkStatus = (status, currentLang) => {
  switch (status) {
    case "DRAFT":
      return currentLang === "pt" ? "Rascunho" : "Draft";
    case "SUBMITTED":
      return currentLang === "pt" ? "Enviado" : "Sent";
    case "PENDING_CHANGES":
      return currentLang === "pt" ? "Aprovado" : "Approved";
    case "PUBLISHED":
      return currentLang === "pt" ? "Publicado" : "Published";
    case "REJECTED":
      return currentLang === "pt" ? "Rejeitado" : "Rejected";
    default:
      return currentLang === "pt" ? "Desconhecido" : "Unknown";
  }
};

export const isTeacher = () => {
  return hasRole(ROLES.TEACHER);
};

export const mapStatusToBackend = (status) => {
  const statusMap = {
    draft: "DRAFT",
    submitted: "SUBMITTED",
    published: "PUBLISHED",
    pending_changes: "PENDING_CHANGES",
    rejected: "REJECTED",
  };
  return statusMap[status?.toLowerCase()] || "DRAFT";
};

export const mapWorkTypeToBackend = (workType) => {
  const typeMap = {
    ARTICLE: "ARTICLE",
    RESEARCH: "SEARCH",
    DISSERTATION: "DISSERTATION",
    EXTENSION: "EXTENSION",
    FINAL_THESIS: "FINAL_THESIS",
  };
  return typeMap[workType] || workType;
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const formatAuthorsForBackend = (authorsArray) => {
  const newAuthors = authorsArray
    .filter((author) => !author.id)
    .map(({ name, email }) => ({ name, email }));

  const studentIds = authorsArray
    .filter((author) => author.id)
    .map((author) => author.id);

  return { newAuthors, studentIds };
};

export const formatLabelsForBackend = (labelsArray) => {
  return labelsArray.map((label) => {
    const labelName =
      typeof label === "string"
        ? label
        : label && typeof label === "object"
        ? label.label || label.name || String(label)
        : String(label);

    const labelColor = (label && label.color) || "#3B82F6";

    const colorHex = labelColor.startsWith("#") ? labelColor : `#${labelColor}`;

    return {
      name: labelName,
      color: colorHex,
    };
  });
};

export const formatLinksForBackend = (linksArray) => {
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
