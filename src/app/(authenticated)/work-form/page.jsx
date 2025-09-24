import React, { useState, useEffect } from "react";
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
import { ROLES } from "../../../enums/roles";

const WorkFormPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const mode = searchParams.get('mode') || (id ? 'edit' : 'create');
  const isEditMode = mode === 'edit' && id !== undefined && id !== null && id !== "";
  const workId = id;
  
  const { getLabelSuggestions, getLinkSuggestions, getAuthorSuggestions } =
    useGetSuggestions();

  const { 
    isLoading: isCreating, 
    error: createError, 
    saveDraft: saveDraftCreate, 
    submitForReview: submitForReviewCreate, 
    publish: publishCreate 
  } = useCreateWork();
  
  const { 
    isLoading: isUpdating, 
    error: updateError, 
    saveDraft: saveDraftUpdate, 
    submitForReview: submitForReviewUpdate 
  } = useUpdateWork();

  const [authors, setAuthors] = useState([]);
  const [labels, setLabels] = useState([]);
  const [links, setLinks] = useState([]);
  const [workType, setWorkType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [abstract, setAbstract] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  const userIsAuthenticated = isAuthenticated();
  const isStudent = hasRole(ROLES.STUDENT);
  const isTeacher = hasRole(ROLES.TEACHER);
  const isAdmin = hasRole(ROLES.ADMIN);
  const currentUser = getStoredUser();

  const isLoading = isLoadingData || isCreating || isUpdating;
  const error = createError || updateError;

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
        setAbstract(workData.content || "");
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
        setAuthors(workData.authors || []);
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
  }, [workId, isEditMode, navigate, searchParams]);

  const getWorkData = () => ({
    title,
    description,
    abstractText: abstract,
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

  const validateCompleteForm = () => {
    const workData = getWorkData();
    const formErrors = validateForm(workData, t);

    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      const errorMessages = Object.values(formErrors).join("\n");
      alert(errorMessages);
      return false;
    }

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

  const getSuccessRedirectPath = () => {
    const currentLang = i18n.language;
    if (isEditMode) {
      const myWorksPath = currentLang === "pt" ? "meus-trabalhos" : "my-works";
      return `/${currentLang}/${myWorksPath}`;
    }
    return `/${currentLang}`;
  };

  const handleSaveDraft = async () => {
    console.log('Debug - handleSaveDraft called, isLoading:', isLoading);
    
    if (isLoading) {
      console.log('Debug - Already loading, skipping');
      return;
    }

    try {
      const workData = getWorkData();
      console.log('Debug - Work data for save:', workData);
      
      if (isEditMode) {
        if (!workId) {
          throw new Error(t("errors.invalidWorkId") || "Invalid work ID. Cannot update work.");
        }
        console.log('Debug - Calling saveDraftUpdate with workId:', workId);
        await saveDraftUpdate(workId, workData);
      } else {
        console.log('Debug - Calling saveDraftCreate');
        await saveDraftCreate(workData);
      }
      
      alert(t("messages.draftSaved") || "Draft saved successfully!");
      navigate(getSuccessRedirectPath());
    } catch (error) {
      console.error('Debug - Error in handleSaveDraft:', error);
      alert(error.message);
    }
  };

  const handleSendForReview = async () => {
    console.log('Debug - handleSendForReview called, isLoading:', isLoading);
    
    if (isLoading) {
      console.log('Debug - Already loading, skipping');
      return;
    }

    if (!validateCompleteForm()) {
      return;
    }

    try {
      const workData = getWorkData();
      console.log('Debug - Work data for review:', workData);
      
      if (isEditMode) {
        if (!workId) {
          throw new Error(t("errors.invalidWorkId") || "Invalid work ID. Cannot update work.");
        }
        console.log('Debug - Calling submitForReviewUpdate with workId:', workId);
        await submitForReviewUpdate(workId, workData);
      } else {
        console.log('Debug - Calling submitForReviewCreate');
        await submitForReviewCreate(workData);
      }
      
      alert(
        t("messages.sentForReview") ||
          "Work sent for review successfully!"
      );
      navigate(getSuccessRedirectPath());
    } catch (error) {
      console.error('Debug - Error in handleSendForReview:', error);
      alert(error.message);
    }
  };

  const handlePublish = async () => {
    if (!validateCompleteForm()) {
      return;
    }

    try {
      const workData = getWorkData();
      await publishCreate(workData);
      alert(t("messages.published") || "Work published successfully!");
      navigate(getSuccessRedirectPath());
    } catch (error) {
      alert(error.message);
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

  const handleAbstractChange = (e) => {
    const value = e.target.value;
    setAbstract(value);
    validateSingleField("abstractText", value);
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

  return (
    <div className="work-form-page">
      <form onSubmit={handleSubmit} className="work-form">
        {/* TODO: Implement image upload for works */}

        <div className="work-form-field">
          <label>{t("new-work.worktype") + "*"}</label>
          <WorkTypeSelector 
            onTypeChange={handleWorkTypeChange} 
            selectedType={workType}
          />
          {errors.workType && (
            <span className="error-message">{errors.workType}</span>
          )}
        </div>

        <div className="work-form-field">
          <label>{t("new-work.worktitle") + "*"}</label>
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder={t("new-work.worktitle")}
            className={errors.title ? "field-error" : ""}
            required
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="work-form-field">
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

        <div className="work-form-field">
          <label>{t("new-work.workdescription")}</label>
          <div className="word-count-info">{countWords(description)}/160</div>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder={t("new-work.workdescription")}
            className={errors.description ? "field-error" : ""}
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="work-form-field">
          <label>{t("new-work.workabstract")}</label>
          <div className="word-count-info">{countWords(abstract)}/300</div>
          <textarea
            value={abstract}
            onChange={handleAbstractChange}
            placeholder={t("new-work.workabstract")}
            className={errors.abstractText ? "field-error" : ""}
          />
          {errors.abstractText && (
            <span className="error-message">{errors.abstractText}</span>
          )}
        </div>

        <div className="work-form-field">
          <label>Labels</label>
          <LabelInput
            labels={labels}
            setLabels={handleLabelsChange}
            getSuggestions={getLabelSuggestions}
          />
        </div>

        <div className="work-form-field">
          <label>Links</label>
          <LinkInput
            links={links}
            setLinks={handleLinksChange}
            getSuggestions={getLinkSuggestions}
          />
        </div>

        <div className="work-form-buttons">
          <Button variant="secondary" onClick={handleBack} disabled={isLoading}>
            {t("common.back") || "Back"}
          </Button>

          <Button variant="primary" onClick={handleSaveDraft} disabled={isLoading}>
            {isLoading ? (t("common.loading") || "Loading...") : (t("common.save") || "Save")}
          </Button>

          {userIsAuthenticated && isStudent && (
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (t("common.loading") || "Loading...") : (t("new-work.send") || "Send")}
            </Button>
          )}

          {userIsAuthenticated && (isTeacher || isAdmin) && !isEditMode && (
            <Button variant="tertiary" onClick={handlePublish} disabled={isLoading}>
              {isLoading ? (t("common.loading") || "Loading...") : (t("new-work.publish") || "Publish")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkFormPage;
