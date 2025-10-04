import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./page.css";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../../components/button";
import {
  Input,
  AuthorInput,
  LabelInput,
  LinkInput,
} from "../../../components/input";
import WorkTypeSelector from "../../../components/work-type-selector/WorkTypeSelector";
import ImageUpload from "../../../components/image-upload/ImageUpload";
import {
  isAuthenticated,
  hasRole,
  getStoredUser,
} from "../../../services/hooks/auth/useAuth";
import {
  countWords,
  validateField,
  validateForm,
} from "../../../services/utils/validation";
import { useGetSuggestions } from "../../../services/hooks/suggestions/useGetSuggestions.js";
import { getWork } from "../../../services/works/get";
import { useCreateWork } from "./useCreateWork";
import { useUpdateWork } from "./useUpdateWork";
import { useImageUpload } from "./useImageUpload";
import { ROLES } from "../../../enums/roles";
import useFormCacheStore from "../../../storage/formCache.storage";

const WorkFormPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode") || (id ? "edit" : "create");
  const isEditMode =
    mode === "edit" && id !== undefined && id !== null && id !== "";
  const workId = id;

  const { getLabelSuggestions, getLinkSuggestions, getAuthorSuggestions } =
    useGetSuggestions();

  const {
    isLoading: isCreating,
    error: createError,
    saveDraft: saveDraftCreate,
    submitForReview: submitForReviewCreate,
    publish: publishCreate,
  } = useCreateWork();

  const {
    isLoading: isUpdating,
    error: updateError,
    saveDraft: saveDraftUpdate,
    submitForReview: submitForReviewUpdate,
  } = useUpdateWork();

  const { handleImageUpload, isUploading, uploadError } = useImageUpload();

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
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const userIsAuthenticated = isAuthenticated();
  const isStudent = hasRole(ROLES.STUDENT);
  const isTeacher = hasRole(ROLES.TEACHER);
  const isAdmin = hasRole(ROLES.ADMIN);
  const currentUser = useMemo(() => getStoredUser(), []);

  const isLoading = isLoadingData || isCreating || isUpdating || isUploading;
  const error = createError || updateError || uploadError;

  useEffect(() => {
    if (isEditMode) {
    } else if (currentUser) {
      setAuthors([
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      ]);
    }
  }, [isEditMode, currentUser]);

  useEffect(() => {
    if (!isEditMode && hasCachedData()) {
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
        setImageUrl(cachedData.imageUrl || "");
      }
    }
  }, [isEditMode, hasCachedData, getCachedFormData]);

  useEffect(() => {
    if (!isEditMode) {
      const formData = {
        authors,
        labels,
        links,
        studentIds,
        workType,
        title,
        description,
        content,
        imageUrl,
      };

      if (
        workType ||
        title ||
        authors.length > 0 ||
        description ||
        content ||
        imageUrl
      ) {
        saveFormData(formData);
      }
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
    imageUrl,
    saveFormData,
    isEditMode,
  ]);

  useEffect(() => {
    const fetchWorkData = async () => {
      if (!isEditMode || !workId) {
        return;
      }

      setIsLoadingData(true);
      try {
        const workData = await getWork(Number(workId));

        if (!userIsAuthenticated || !currentUser) {
          navigate(-1);
          return;
        }

        setTitle(workData.title || "");
        setDescription(workData.description || "");
        setContent(workData.content || "");
        setImageUrl(workData.imageUrl || "");

        const mapWorkTypeFromBackend = (backendWorkType) => {
          if (!backendWorkType || !backendWorkType.name) return "";

          const typeMap = {
            ARTICLE: "ARTICLE",
            SEARCH: "RESEARCH",
            DISSERTATION: "DISSERTATION",
            EXTENSION: "EXTENSION",
            FINAL_THESIS: "FINAL_THESIS",
          };

          return typeMap[backendWorkType.name] || "";
        };

        setWorkType(mapWorkTypeFromBackend(workData.workType));

        const fetchedAuthors = workData.authors || [];
        setAuthors(fetchedAuthors);
        setStudentIds(
          fetchedAuthors
            .filter((author) => author.id)
            .map((author) => author.id)
        );

        setLabels(workData.labels || []);
        setLinks(workData.links || []);
      } catch (error) {
        console.error("Failed to fetch work data:", error);
        alert("Failed to load work data. Please try again.");
        navigate(-1);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchWorkData();
  }, [
    workId,
    isEditMode,
    navigate,
    searchParams,
    userIsAuthenticated,
    currentUser,
  ]);

  const getWorkData = () => ({
    title,
    description,
    content,
    studentIds,
    authors: authors,
    labels: labels,
    links: links,
    workType,
    imageUrl,
  });

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

  const validateRequiredFields = (showErrors = true) => {
    const workData = getWorkData();
    const requiredErrors = {};

    if (!workData.workType) {
      requiredErrors.workType =
        t("errors.workTypeRequired") || "O tipo do trabalho é obrigatório.";
    }

    if (!workData.title || workData.title.trim() === "") {
      requiredErrors.title =
        t("errors.titleRequired") || "O título do trabalho é obrigatório.";
    }

    if (!workData.authors || workData.authors.length === 0) {
      requiredErrors.authors =
        t("errors.authorsRequired") ||
        "O campo de autores não pode estar vazio.";
    }

    if (!workData.description || workData.description.trim() === "") {
      requiredErrors.description =
        t("errors.descriptionRequired") ||
        "O campo de descrição não pode estar vazio.";
    }

    setErrors(requiredErrors);

    if (Object.keys(requiredErrors).length > 0) {
      if (showErrors) {
        setShowValidationErrors(true);
        const errorMessages = Object.values(requiredErrors).join("\n");
        alert(
          (t("errors.requiredFieldsMissing") ||
            "Campos obrigatórios não preenchidos:") +
            "\n\n" +
            errorMessages
        );
      }
      return false;
    }

    return validateCompleteForm(showErrors);
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

  const getSuccessRedirectPath = () => {
    const currentLang = i18n.language;
    if (isEditMode) {
      const myWorksPath = currentLang === "pt" ? "meus-trabalhos" : "my-works";
      return `/${currentLang}/${myWorksPath}`;
    }
    return `/${currentLang}`;
  };

  const handleSaveDraft = async () => {
    if (!validateRequiredFields(true)) return;

    try {
      let finalImageUrl = imageUrl;

      if (selectedImageFile) {
        finalImageUrl = await handleImageUpload(selectedImageFile);
        setImageUrl(finalImageUrl);
      }

      const workData = {
        ...getWorkData(),
        imageUrl: finalImageUrl,
      };

      if (isEditMode) {
        if (!workId) {
          throw new Error(
            t("errors.invalidWorkId") || "Invalid work ID. Cannot update work."
          );
        }
        await saveDraftUpdate(workId, workData);
      } else {
        await saveDraftCreate(workData);
      }

      alert(t("messages.draftSaved") || "Draft saved successfully!");
      if (!isEditMode) clearFormData();
      navigate(getSuccessRedirectPath());
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
      let finalImageUrl = imageUrl;
      if (selectedImageFile) {
        finalImageUrl = await handleImageUpload(selectedImageFile);
        setImageUrl(finalImageUrl);
      }

      const workData = {
        ...getWorkData(),
        imageUrl: finalImageUrl,
      };

      if (isEditMode) {
        if (!workId) {
          throw new Error(
            t("errors.invalidWorkId") || "Invalid work ID. Cannot update work."
          );
        }
        await submitForReviewUpdate(workId, workData);
      } else {
        await submitForReviewCreate(workData);
      }

      alert(
        t("messages.sentForReview") || "Work sent for review successfully!"
      );
      if (!isEditMode) clearFormData();
      navigate(getSuccessRedirectPath());
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
      let finalImageUrl = imageUrl;
      if (selectedImageFile) {
        finalImageUrl = await handleImageUpload(selectedImageFile);
        setImageUrl(finalImageUrl);
      }

      const workData = {
        ...getWorkData(),
        imageUrl: finalImageUrl,
      };

      await publishCreate(workData);
      alert(t("messages.published") || "Work published successfully!");
      if (!isEditMode) clearFormData();
      navigate(getSuccessRedirectPath());
    } catch (error) {
      if (error.response?.status !== 401) {
        alert(error.message);
      }
    }
  };

  const handleFieldBlur = (fieldName, value) => {
    validateSingleField(fieldName, value);
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
    const newStudentIds = newAuthors
      .filter((author) => author.id && author.id !== currentUser.id)
      .map((author) => author.id);

    setStudentIds(newStudentIds);
    validateSingleField("authors", newAuthors);
  };

  const handleLabelsChange = useCallback((newLabels) => {
    setLabels(newLabels);
    validateSingleField("labels", newLabels);
  }, []);

  const handleLinksChange = useCallback((newLinks) => {
    setLinks(newLinks);
    validateSingleField("links", newLinks);
  }, []);

  const handleImageChange = (file) => {
    setSelectedImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {};
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="work-form-page">
      <form onSubmit={handleSubmit} className="work-form">
        <div id="work-image" className="work-form-field">
          <ImageUpload
            onImageChange={handleImageChange}
            initialImageUrl={imageUrl}
            disabled={isUploading}
            className={errors.image ? "field-error" : ""}
          />
          {isUploading && (
            <span className="info-message">
              {t("new-work.uploadingImage") || "Fazendo upload da imagem..."}
            </span>
          )}
          {uploadError && <span className="error-message">{uploadError}</span>}
        </div>

        <div id="work-type" className="work-form-field">
          <label>{t("new-work.worktype") + "*"}</label>
          <WorkTypeSelector
            onTypeChange={handleWorkTypeChange}
            selectedType={workType}
          />
          {errors.workType && (
            <span className="error-message">{errors.workType}</span>
          )}
        </div>

        <div id="work-title" className="work-form-field">
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

        <div id="work-authors" className="work-form-field">
          <label>{t("new-work.workauthors")}</label>
          <AuthorInput
            authors={authors}
            setAuthors={handleAuthorsChange}
            getSuggestions={getAuthorSuggestions}
            currentUser={currentUser}
            mode={mode}
          />
          {errors.authors && (
            <span className="error-message">{errors.authors}</span>
          )}
        </div>

        <div id="work-description" className="work-form-field">
          <label>{t("new-work.workdescription")}</label>
          <div className="word-count-info">{countWords(description)}/160</div>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            onBlur={() => handleFieldBlur("description", description)}
            placeholder={t("new-work.workdescription")}
            className={errors.description ? "field-error" : ""}
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div id="work-abstract" className="work-form-field">
          <label>{t("new-work.workcontent")}</label>
          <div className="word-count-info">{countWords(content)}/300</div>
          <textarea
            value={content}
            onChange={handleContentChange}
            onBlur={() => handleFieldBlur("content", content)}
            placeholder={t("new-work.workabstract")}
            className={errors.content ? "field-error" : ""}
          />
          {errors.content && (
            <span className="error-message">{errors.content}</span>
          )}
        </div>

        <div id="work-labels" className="work-form-field">
          <label>Labels</label>
          <LabelInput
            labels={labels}
            setLabels={handleLabelsChange}
            getSuggestions={getLabelSuggestions}
          />
        </div>

        <div id="work-links" className="work-form-field">
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

        <div className="work-form-buttons">
          <Button variant="secondary" onClick={handleBack} disabled={isLoading}>
            {t("common.back") || "Back"}
          </Button>

          <Button onClick={handleSaveDraft} disabled={isLoading}>
            {isLoading ? t("common.loading") : t("common.save")}
          </Button>

          {userIsAuthenticated && isStudent && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("new-work.send")}
            </Button>
          )}

          {userIsAuthenticated && (isTeacher || isAdmin) && !isEditMode && (
            <Button onClick={handlePublish} disabled={isLoading}>
              {isLoading ? t("common.loading") : t("new-work.publish")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkFormPage;
