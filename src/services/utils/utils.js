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
