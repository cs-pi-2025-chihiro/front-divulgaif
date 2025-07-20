export const countWords = (text) => {
  if (!text || text.trim() === "") return 0;
  return text.trim().split(/\s+/).length;
};

export const validateField = (fieldName, value, t) => {
  const errors = {};

  switch (fieldName) {
    case "workType":
      if (!value) {
        errors.workType = t("errors.workTypeRequired");
      }
      break;
    case "title":
      if (!value || value.trim() === "") {
        errors.title = t("errors.titleRequired");
      }
      break;
    case "authors":
      if (!value || value.length === 0) {
        errors.authors = t("errors.authorsRequired");
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
    default:
      break;
  }

  return errors;
};

export const validateForm = (data, t) => {
  const errors = {};

  if (!data.workType) {
    errors.workType = t("errors.workTypeRequired");
  }

  if (!data.title || data.title.trim() === "") {
    errors.title = t("errors.titleRequired");
  }

  if (data.authors.length === 0) {
    errors.authors = t("errors.authorsRequired");
  }

  const descriptionWordCount = countWords(data.description);
  if (descriptionWordCount > 160) {
    errors.description =
      t("errors.descriptionTooLong") ||
      "A descrição deve ter no máximo 160 palavras";
  }

  return errors;
};
