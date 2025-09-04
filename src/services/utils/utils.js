import { useNavigate } from "react-router-dom";

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
  console.log("status", status);
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

export const mapStatusToBackend = (status) => {
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
  const newAuthors = [];
  const existingAuthors = [];

  authorsArray.forEach((author) => {
    if (author.id && !String(author.id).startsWith('new_')) {
      existingAuthors.push({ id: author.id });
    } else {
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
    }
  });

  return { newAuthors, existingAuthors };
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

    const colorHex = labelColor.startsWith("#")
      ? labelColor
      : `#${labelColor}`;

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
