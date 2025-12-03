export const countWords = (text) => {
  if (!text || text.trim() === "") return 0;
  return text.trim().split(/\s+/).length;
};

export const validateField = (fieldName, value, t) => {
  const errors = {};

  switch (fieldName) {
    case "workType":
      if (!value) {
        errors.workType =
          t("errors.workTypeRequired") || "O tipo do trabalho é obrigatório.";
      }
      break;
    case "title":
      if (!value || value.trim() === "") {
        errors.title =
          t("errors.titleRequired") || "O título do trabalho é obrigatório.";
      } else if (value.trim().length < 3) {
        errors.title =
          t("errors.titleTooShort") ||
          "O título deve ter pelo menos 3 caracteres.";
      } else if (value.trim().length > 200) {
        errors.title =
          t("errors.titleTooLong") ||
          "O título deve ter no máximo 200 caracteres.";
      }
      break;
    case "description":
      const descriptionWordCount = countWords(value);
      if (descriptionWordCount > 160) {
        errors.description =
          t("errors.descriptionTooLong") ||
          "A descrição deve ter no máximo 160 palavras";
      }
      break;
    case "content":
      const contentWordCount = countWords(value);
      if (contentWordCount > 300) {
        errors.content =
          t("errors.contentTooLong") ||
          "O conteúdo deve ter no máximo 300 palavras";
      }
      break;
    default:
      break;
  }

  return errors;
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const validateForm = (data, t) => {
  const errors = {};

  if (!data.workType) {
    errors.workType =
      t("errors.workTypeRequired") || "O tipo do trabalho é obrigatório.";
  }

  if (!data.title || data.title.trim() === "") {
    errors.title =
      t("errors.titleRequired") || "O título do trabalho é obrigatório.";
  } else if (data.title.trim().length < 3) {
    errors.title =
      t("errors.titleTooShort") || "O título deve ter pelo menos 3 caracteres.";
  } else if (data.title.trim().length > 200) {
    errors.title =
      t("errors.titleTooLong") || "O título deve ter no máximo 200 caracteres.";
  }

  if (!data.authors || data.authors.length === 0) {
    errors.authors =
      t("errors.authorsRequired") || "O campo de autores não pode estar vazio.";
  }

  const descriptionWordCount = countWords(data.description);
  if (descriptionWordCount > 160) {
    errors.description =
      t("errors.descriptionTooLong") ||
      "A descrição deve ter no máximo 160 palavras";
  }

  const abstractWordCount = countWords(data.abstractText);
  if (abstractWordCount > 300) {
    errors.abstractText =
      t("errors.abstractTooLong") || "O resumo deve ter no máximo 300 palavras";
  }

  if (data.links && data.links.length > 0) {
    data.links.forEach((link, index) => {
      if (link.url && !isValidUrl(link.url)) {
        errors.links =
          t("errors.invalidUrl") || "Um ou mais links são inválidos.";
      }
    });
  }

  return errors;
};

export const validateCPF = (cpf) => {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length === 0) return true;
  if (cleaned.length !== 11) return false;
  return /^\d{11}$/.test(cleaned);
};

export const formatCPF = (value) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9)
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
    6,
    9
  )}-${cleaned.slice(9, 11)}`;
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
