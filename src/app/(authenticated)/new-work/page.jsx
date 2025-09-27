import React, { useState, useEffect } from "react";
import "./page.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button";
import {
  Input,
  AuthorInput,
  LabelInput,
  LinkInput,
} from "../../../components/input";
import WorkTypeSelector from "../../../components/work-type-selector/WorkTypeSelector";
import { isAuthenticated, hasRole } from "../../../services/hooks/auth/useAuth";
import { useCreateWork } from "./useCreateWork";
import {
  countWords,
  validateField,
  validateForm,
} from "../../../services/utils/validation";
import { useGetSuggestions } from "../../../services/hooks/suggestions/useGetSuggestions.js";
import { ROLES } from "../../../enums/roles.js";
import useFormCacheStore from "../../../storage/formCache.storage";

const NewWork = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isLoading, error, saveDraft, submitForReview, publish } =
    useCreateWork();
  const { getLabelSuggestions, getLinkSuggestions, getAuthorSuggestions } =
    useGetSuggestions();
  const { saveFormData, getCachedFormData, clearFormData, hasCachedData } =
    useFormCacheStore();

  const [authors, setAuthors] = useState([]);
  const [labels, setLabels] = useState([]);
  const [links, setLinks] = useState([]);
  const [studentIds, setStudentIds] = useState([]);
  const [workType, setWorkType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const userIsAuthenticated = isAuthenticated();
  const isStudent = hasRole(ROLES.STUDENT);
  const isTeacher = hasRole(ROLES.TEACHER);
  const isAdmin = hasRole(ROLES.ADMIN);

  useEffect(() => {
    if (hasCachedData()) {
      const cachedData = getCachedFormData();
      if (cachedData) {
        setAuthors(cachedData.authors || []);
        setLabels(cachedData.labels || []);
        setLinks(cachedData.links || []);
        setStudentIds(cachedData.studentIds || []);
        setWorkType(cachedData.workType || "");
        setTitle(cachedData.title || "");
        setDescription(cachedData.description || "");
        setContent(cachedData.content || "");
      }
    }
  }, [hasCachedData, getCachedFormData, clearFormData, t]);

  useEffect(() => {
    const formData = {
      authors,
      labels,
      links,
      studentIds,
      workType,
      title,
      description,
      content: content,
    };

    if (workType || title || authors.length > 0 || description || content) {
      saveFormData(formData);
    }
  }, [
    authors,
    labels,
    links,
    studentIds,
    workType,
    title,
    description,
    content,
    saveFormData,
  ]);

  const getWorkData = () => {
    const studentIds = authors
      .filter((author) => author.id)
      .map((author) => author.id);

    const newAuthors = authors
      .filter((author) => !author.id)
      .map(({ name, email }) => ({ name, email }));

    return {
      title,
      description,
      content,
      studentIds,
      newAuthors,
      workLabels: labels,
      workLinks: links,
      workType,
    };
  };

  const validateSingleField = (fieldName, value) => {
    const fieldErrors = validateField(fieldName, value, t);
    const newErrors = { ...errors };

    if (Object.keys(fieldErrors).length > 0) {
      Object.assign(newErrors, fieldErrors);
    } else {
      delete newErrors[fieldName];
    }

    setErrors(newErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const validateCompleteForm = (showErrors = true) => {
    const workData = getWorkData();
    const formErrors = validateForm(workData, t);

    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      if (showErrors) {
        setShowValidationErrors(true);
        const errorMessages = Object.values(formErrors).join("\n");
        alert(
          (t("errors.validationFailed") ||
            "Por favor, corrija os erros no formulário:") +
            "\n\n" +
            errorMessages
        );
      }
      return false;
    }

    setShowValidationErrors(false);
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateCompleteForm()) {
      handleSendForReview();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSaveDraft = async () => {
    try {
      const workData = getWorkData();
      await saveDraft(workData);
      alert(t("messages.draftSaved") || "Rascunho salvo com sucesso!");

      clearFormData();

      const currentLang = i18n.language;
      navigate(`/${currentLang}`);
    } catch (error) {
      if (error.response?.status !== 401) {
        alert(error.message);
      }
    }
  };

  const handleSendForReview = async () => {
    if (!validateCompleteForm(true)) {
      return;
    }

    try {
      const workData = getWorkData();
      await submitForReview(workData);
      alert(
        t("messages.sentForReview") ||
          "Trabalho enviado para avaliação com sucesso!"
      );

      clearFormData();

      const currentLang = i18n.language;
      navigate(`/${currentLang}`);
    } catch (error) {
      if (error.response?.status !== 401) {
        alert(error.message);
      }
    }
  };

  const handlePublish = async () => {
    if (!validateCompleteForm()) {
      return;
    }

    try {
      const workData = getWorkData();
      await publish(workData);
      alert(t("messages.published") || "Trabalho publicado com sucesso!");

      clearFormData();

      const currentLang = i18n.language;
      navigate(`/${currentLang}`);
    } catch (error) {
      if (error.response?.status !== 401) {
        alert(error.message);
      }
    }
  };

  const handleWorkTypeChange = (selectedType) => {
    setWorkType(selectedType);
    validateSingleField("workType", selectedType);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    validateSingleField("title", value);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    validateSingleField("description", value);
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    validateSingleField("content", value);
  };

  const handleAuthorsChange = (newAuthors) => {
    setAuthors(newAuthors);
    validateSingleField("authors", newAuthors);
  };

  const handleLabelsChange = (newLabels) => {
    setLabels(newLabels);
    validateSingleField("labels", newLabels);
  };

  const handleLinksChange = (newLinks) => {
    setLinks(newLinks);
    validateSingleField("links", newLinks);
  };

  const handleFieldBlur = (fieldName, value) => {
    validateSingleField(fieldName, value);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="new-work-form">
        {/* TODO: Implementar upload de imagem para trabalhos */}

        <div id="work-type">
          <label>{t("new-work.worktype") + "*"}</label>
          <WorkTypeSelector onTypeChange={handleWorkTypeChange} />
          {errors.workType && (
            <span className="error-message">{errors.workType}</span>
          )}
        </div>

        <div id="work-title">
          <label>{t("new-work.worktitle") + "*"}</label>
          <Input
            value={title}
            onChange={handleTitleChange}
            onBlur={() => handleFieldBlur("title", title)}
            placeholder={t("new-work.worktitle")}
            className={errors.title ? "field-error" : ""}
            required
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div id="work-authors">
          <label>{t("new-work.workauthors")}</label>
          <AuthorInput
            authors={authors}
            setAuthors={handleAuthorsChange}
            getSuggestions={getAuthorSuggestions}
          />
          {errors.authors && (
            <span className="error-message">{errors.authors}</span>
          )}
        </div>

        <div id="work-description">
          <label>{t("new-work.workdescription")}</label>
          <div className="word-count-info">{countWords(description)}/160</div>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            onBlur={() => handleFieldBlur("description", description)}
            placeholder={t("new-work.workdescription")}
            className={errors.description ? "field-error" : ""}
          ></textarea>
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div id="work-abstract">
          <label className="new-work-label">{t("new-work.workcontent")}</label>
          <div className="word-count-info">{countWords(content)}/300</div>
          <textarea
            value={content}
            onChange={handleContentChange}
            onBlur={() => handleFieldBlur("content", content)}
            placeholder={t("new-work.workcontent")}
            className={errors.content ? "field-error" : ""}
          ></textarea>
          {errors.content && (
            <span className="error-message">{errors.content}</span>
          )}
        </div>

        <div id="work-labels">
          <label>Labels</label>
          <LabelInput
            labels={labels}
            setLabels={handleLabelsChange}
            getSuggestions={getLabelSuggestions}
          />
        </div>

        <div id="work-links">
          <label>Links</label>
          <LinkInput
            links={links}
            setLinks={handleLinksChange}
            getSuggestions={getLinkSuggestions}
          />
          {errors.links && (
            <span className="error-message">{errors.links}</span>
          )}
        </div>

        <div id="new-work-buttons">
          <Button onClick={handleBack} disabled={isLoading}>
            {t("common.back")}
          </Button>

          <Button onClick={handleSaveDraft} disabled={isLoading}>
            {isLoading ? t("common.loading") : t("common.save")}
          </Button>

          {userIsAuthenticated && isStudent && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("new-work.send")}
            </Button>
          )}

          {userIsAuthenticated && (isTeacher || isAdmin) && (
            <Button onClick={handlePublish} disabled={isLoading}>
              {isLoading ? t("common.loading") : t("new-work.publish")}
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default NewWork;
