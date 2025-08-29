import React, { useState, useEffect } from "react";
import "./page.css";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../../components/button";
import {
  Input,
  AuthorInput,
  LabelInput,
  LinkInput,
} from "../../../../components/input";
import WorkTypeSelector from "../../../../components/work-type-selector/WorkTypeSelector";
import { isAuthenticated, hasRole } from "../../../../services/hooks/auth/useAuth";
import { useUpdateWork } from "../../../../services/works/useUpdateWork";
import {
  countWords,
  validateField,
  validateForm,
} from "../../../../services/utils/validation";
import { useGetSuggestions } from "../../../../services/works/useGetSuggestions.js";
import { getWork } from "../../../../services/works/get";


const EditWork = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoading, error, saveDraft, submitForReview } = useUpdateWork();
  const { getLabelSuggestions, getLinkSuggestions, getAuthorSuggestions } =
    useGetSuggestions();

  const [authors, setAuthors] = useState([]);
  const [labels, setLabels] = useState([]);
  const [links, setLinks] = useState([]);
  const [workType, setWorkType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [abstract, setAbstract] = useState("");
  const [errors, setErrors] = useState({});

  const userIsAuthenticated = isAuthenticated();
  const isStudent = hasRole("IS_STUDENT");

  useEffect(() => {
    const fetchWorkData = async () => {
      try {
        const workId = Number(id);
        const workData = await getWork(workId);
        setTitle(workData.title || "");
        setDescription(workData.description || "");
        setAbstract(workData.content || "");
        
        const mapWorkTypeFromBackend = (backendWorkType) => {
          if (!backendWorkType || !backendWorkType.name) return "";
          
          const typeMap = {
            "ARTICLE": "ARTICLE",
            "SEARCH": "RESEARCH",
            "DISSERTATION": "DISSERTATION",
            "EXTENSION": "EXTENSION",
            "FINAL_THESIS": "FINAL_THESIS"
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
      }
    };

    if (id) {
      fetchWorkData();
    }
  }, [id, navigate]);


  const getWorkData = () => ({
    title,
    description,
    abstractText: abstract,
    authors: authors,
    labels: labels,
    links: links,
    workType,
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

  const handleSaveDraft = async () => {
    try {
      const workData = getWorkData();
      await saveDraft(id, workData);
      alert(t("messages.draftSaved") || "Rascunho salvo com sucesso!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSendForReview = async () => {
    if (!validateCompleteForm()) {
      return;
    }

    try {
      const workData = getWorkData();
      await submitForReview(id, workData);
      alert(
        t("messages.sentForReview") ||
          "Trabalho enviado para avaliação com sucesso!"
      );
      navigate(-1);
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
    <>
      <form onSubmit={handleSubmit} id="edit-work-form">
        <div id="work-type">
          <label>{t("new-work.worktype") + "*"}</label>
          <WorkTypeSelector onTypeChange={handleWorkTypeChange} selectedType={workType} />
          {errors.workType && (
            <span className="error-message">{errors.workType}</span>
          )}
        </div>

        <div id="work-title">
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
            placeholder={t("new-work.workdescription")}
            className={errors.description ? "field-error" : ""}
          ></textarea>
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div id="work-abstract">
          <label className="new-work-label">{t("new-work.workabstract")}</label>
          <div className="word-count-info">{countWords(abstract)}/300</div>
          <textarea
            value={abstract}
            onChange={handleAbstractChange}
            placeholder={t("new-work.workabstract")}
            className={errors.abstractText ? "field-error" : ""}
          ></textarea>
          {errors.abstractText && (
            <span className="error-message">{errors.abstractText}</span>
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
        </div>

        <div id="edit-work-buttons">
          <Button onClick={handleBack} disabled={isLoading}  className="btn-back">
            {t("common.back")}
          </Button>

          <Button onClick={handleSaveDraft} disabled={isLoading} className="btn-save">
            {isLoading ? t("common.loading") : t("common.save")}
          </Button>

          {userIsAuthenticated && isStudent && (
            <Button type="submit" disabled={isLoading} className="btn-send">
              {isLoading ? t("common.loading") : t("new-work.send")}
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default EditWork;