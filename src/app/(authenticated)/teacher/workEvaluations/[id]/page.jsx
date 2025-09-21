import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Plus, Menu, User } from "lucide-react";
import "./page.css";
import { useWorkData } from "../../../../../hooks/useWorkStore";
import { WORK_TYPES } from "../../../../../enums/workTypes";
import Button from "../../../../../components/button";
import { getWorkTypes, navigateTo } from "../../../../../services/utils/utils";
import { useTranslation } from "react-i18next";
import { useWorkEvaluation } from "./useWorkEvaluation";

const WorkEvaluation = () => {
  const { id } = useParams();
  const workId = Number(id);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const {
    workData: storedWork,
    hasData,
    isLoading: isLoadingWork,
    error,
    loadWork,
  } = useWorkData(workId);
  const [workData, setWorkData] = useState(() => {
    if (storedWork) {
      return {
        id: storedWork.id,
        image: null,
        imageUrl: storedWork.imageUrl || null,
        title: storedWork.title || "",
        workType: getWorkTypes(storedWork.workType.name, currentLang),
        authors: storedWork.authors || [],
        description: storedWork.description || "",
        abstract: storedWork.content || "",
        links: (storedWork.links || []).map((link) =>
          typeof link === "string" ? link : link.url
        ),
        labels: (storedWork.labels || []).map((label) =>
          typeof label === "string"
            ? label
            : label.name || label.title || String(label)
        ),
        status: storedWork.status || t("workEvaluation.status.underReview"),
        feedback: storedWork.feedback || "",
        teachers: storedWork.teachers || null,
        date: storedWork.date || null,
      };
    }
    return {
      id: workId,
      image: null,
      imageUrl: null,
      title: "",
      workType: "",
      type: "",
      authors: [],
      description: "",
      abstract: "",
      links: [],
      labels: [],
      status: t("workEvaluation.status.underReview"),
      feedback: "",
      teachers: null,
      date: null,
    };
  });

  const {
    requestChangesWithData,
    publishWork,
    isRequestChangesLoading,
    isPublishLoading,
    buildRequestChangesPayload,
    mapWorkTypeToBackend,
  } = useWorkEvaluation();

  if (isLoadingWork) {
    return (
      <div className="work-evaluation-container">
        <div className="loading-indicator">
          {t("workEvaluation.loadingWork")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="work-evaluation-container">
        <div className="error-message">
          {t("workEvaluation.errorLoading")} {error}
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({ ...workData });
  const [authorInput, setAuthorInput] = useState({
    name: "",
    email: "",
    type: t("workEvaluation.authors.student"),
  });
  const [linkInput, setLinkInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    if (workData && workData.id) {
      setFormData({ ...workData });
    }
  }, [workData]);

  const [wordCounts, setWordCounts] = useState({
    description: 0,
    abstract: 0,
    feedback: 0,
  });

  useEffect(() => {
    setWordCounts({
      description: formData.description.trim()
        ? formData.description.trim().split(/\s+/).length
        : 0,
      abstract: formData.abstract.trim()
        ? formData.abstract.trim().split(/\s+/).length
        : 0,
      feedback: formData.feedback.trim()
        ? formData.feedback.trim().split(/\s+/).length
        : 0,
    });
  }, [formData.description, formData.abstract, formData.feedback]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange("image", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAuthor = () => {
    if (authorInput.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        authors: [
          ...prev.authors,
          { ...authorInput, name: authorInput.name.trim() },
        ],
      }));
      setAuthorInput({
        name: "",
        email: "",
        type: t("workEvaluation.authors.student"),
      });
    }
  };

  const removeAuthor = (index) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  };

  const addToList = (field, value, setter) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setter("");
    }
  };

  const removeFromList = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      addToList("labels", labelInput, setLabelInput);
      setShowAddLabel(false);
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim() && !formData.links.includes(linkInput.trim())) {
      addToList("links", linkInput, setLinkInput);
      setShowAddLink(false);
    }
  };

  const handleAccept = async () => {
    try {
      const success = await publishWork(workId);
      if (success) {
        setFormData((prev) => ({
          ...prev,
          status: t("workEvaluation.status.accepted"),
        }));
        setShowSuccessMessage(t("workEvaluation.messages.workAccepted"));
        navigateTo("/", navigate, currentLang);
      }
    } catch (error) {
      console.error("Error publishing work:", error);
    }
  };

  const handleReturn = async () => {
    try {
      setFeedbackError("");

      if (!formData.feedback.trim()) {
        setFeedbackError(
          t(
            "workEvaluation.feedback.required",
            "Feedback is required to request changes"
          )
        );
        return;
      }

      const success = await requestChangesWithData(
        workId,
        formData,
        storedWork,
        currentLang
      );

      if (success) {
        setFormData((prev) => ({
          ...prev,
          status: t("workEvaluation.status.returned"),
        }));
        setShowSuccessMessage(t("workEvaluation.messages.workReturned"));
        setTimeout(() => setShowSuccessMessage(""), 5000);
        navigateTo("/", navigate, currentLang);
      }
    } catch (error) {
      console.error("Error requesting changes:", error);
      setFeedbackError(
        t(
          "workEvaluation.feedback.error",
          "Error occurred while requesting changes"
        )
      );
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {showSuccessMessage && (
          <div className="success-message">{showSuccessMessage}</div>
        )}

        <div className="form-container">
          <div className="image-section">
            <div className="image-placeholder">
              {formData.image || formData.imageUrl ? (
                <>
                  <img
                    src={formData.imageUrl}
                    alt="Trabalho"
                    className="uploaded-image"
                  />
                  <button
                    onClick={() => {
                      handleInputChange("image", null);
                      handleInputChange("imageUrl", null);
                    }}
                    className="image-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="upload-prompt">
                  <div className="upload-icon-container">
                    <Upload className="upload-icon" />
                  </div>
                  <p className="upload-text">
                    {t("workEvaluation.imageSection.addImage")}
                  </p>
                  <label className="upload-file-btn">
                    {t("workEvaluation.imageSection.selectFile")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              {t("workEvaluation.form.workType")}
            </label>
            <div className="work-type-buttons">
              {Object.values(WORK_TYPES).map((workType) => {
                const displayName = getWorkTypes(workType, currentLang);
                const isActive = formData.workType === displayName;
                return (
                  <Button
                    key={workType}
                    type="button"
                    onClick={() => {
                      handleInputChange(
                        "workType",
                        getWorkTypes(workType, currentLang)
                      );
                    }}
                    className={`work-type-btn ${isActive ? "active" : ""}`}
                  >
                    {displayName}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              {t("workEvaluation.form.workTitle")}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="form-input"
              placeholder={t("workEvaluation.form.workTitlePlaceholder")}
              required
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              {t("workEvaluation.form.authors")}
            </label>
            <div className="authors-section">
              {formData.authors.map((author, index) => (
                <div key={index} className="author-card">
                  <div className="author-header">
                    <div className="author-info">
                      <User className="author-icon" />
                      <span className="author-name">{author.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="remove-btn"
                      >
                        <X className="remove-icon" />
                      </button>
                    </div>
                  </div>
                  <div className="author-details">
                    <div className="author-field">
                      <label className="field-label">
                        {t("workEvaluation.authors.fullName")}
                      </label>
                      <input
                        type="text"
                        value={author.name}
                        className="author-input"
                        disabled
                      />
                    </div>
                    <div className="author-field">
                      <label className="field-label">
                        {t("workEvaluation.authors.email")}
                      </label>
                      <input
                        type="email"
                        value={author.email}
                        className="author-input"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="author-type-section">
                    <label className="field-label">
                      {t("workEvaluation.authors.type")}
                    </label>
                    <div className="type-buttons">
                      {[
                        t("workEvaluation.authors.student"),
                        t("workEvaluation.authors.teacher"),
                      ].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`type-btn ${
                            author.type === type ||
                            (author.type === "Aluno" &&
                              type === t("workEvaluation.authors.student")) ||
                            (author.type === "Professor" &&
                              type === t("workEvaluation.authors.teacher"))
                              ? "active"
                              : ""
                          }`}
                          disabled
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="add-author-form">
                <div className="author-inputs">
                  <div className="author-field">
                    <input
                      type="text"
                      value={authorInput.name}
                      onChange={(e) =>
                        setAuthorInput((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder={t("workEvaluation.authors.fullName")}
                      className="author-input"
                    />
                  </div>
                  <div className="author-field">
                    <input
                      type="email"
                      value={authorInput.email}
                      onChange={(e) =>
                        setAuthorInput((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder={t("workEvaluation.authors.email")}
                      className="author-input"
                    />
                  </div>
                </div>
                <div className="add-author-footer">
                  <div className="type-buttons">
                    {[
                      t("workEvaluation.authors.student"),
                      t("workEvaluation.authors.teacher"),
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setAuthorInput((prev) => ({ ...prev, type }))
                        }
                        className={`type-btn ${
                          authorInput.type === type ? "active" : ""
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={addAuthor} className="add-btn">
                    {t("workEvaluation.authors.add")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              {t("workEvaluation.form.descriptionWordCount", {
                count: wordCounts.description,
              })}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`form-textarea`}
              placeholder={t("workEvaluation.form.descriptionPlaceholder")}
              required
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              {t("workEvaluation.form.abstractWordCount", {
                count: wordCounts.abstract,
              })}
            </label>
            <textarea
              value={formData.abstract}
              onChange={(e) => handleInputChange("abstract", e.target.value)}
              rows={4}
              className={`form-textarea`}
              placeholder={t(
                "workEvaluation.form.abstractPlaceholder",
                "Enter the abstract or summary..."
              )}
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              {t("workEvaluation.form.labels")}
            </label>
            <div className="labels-section">
              <div className="tags-container">
                {formData.labels.map((label, index) => (
                  <span key={index} className="tag">
                    {typeof label === "string"
                      ? label
                      : label.name || label.title || JSON.stringify(label)}
                    <button
                      type="button"
                      onClick={() => removeFromList("labels", index)}
                      className="tag-remove"
                    >
                      <X className="tag-remove-icon" />
                    </button>
                  </span>
                ))}
                <>
                  {!showAddLabel ? (
                    <button
                      type="button"
                      className="add-tag-btn"
                      onClick={() => setShowAddLabel(true)}
                    >
                      <Plus className="add-icon" />
                    </button>
                  ) : (
                    <div className="add-input-container">
                      <input
                        type="text"
                        value={labelInput}
                        onChange={(e) => setLabelInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddLabel()
                        }
                        placeholder={t("workEvaluation.form.newLabel")}
                        className="add-input"
                        autoFocus
                      />
                      <button onClick={handleAddLabel} className="confirm-btn">
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setShowAddLabel(false);
                          setLabelInput("");
                        }}
                        className="cancel-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              {t("workEvaluation.form.links")}
            </label>
            <div className="links-section">
              {formData.links.map((link, index) => (
                <div key={index} className="link-item">
                  <span className="link-text">
                    {typeof link === "string" ? link : link.url}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromList("links", index)}
                    className="link-remove"
                  >
                    <X className="link-remove-icon" />
                  </button>
                </div>
              ))}
              <>
                {!showAddLink ? (
                  <button
                    type="button"
                    className="add-link-btn"
                    onClick={() => setShowAddLink(true)}
                  >
                    <Plus className="add-icon" />
                    {t("workEvaluation.form.addLink")}
                  </button>
                ) : (
                  <div className="add-link-container">
                    <input
                      type="text"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddLink()}
                      placeholder={t("workEvaluation.form.linkPlaceholder")}
                      className="add-link-input"
                      autoFocus
                    />
                    <button onClick={handleAddLink} className="confirm-btn">
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setShowAddLink(false);
                        setLinkInput("");
                      }}
                      className="cancel-btn"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              {t("workEvaluation.form.feedbackWordCount", {
                count: wordCounts.feedback,
              })}
            </label>
            <textarea
              value={formData.feedback}
              onChange={(e) => {
                handleInputChange("feedback", e.target.value);
                if (feedbackError) setFeedbackError("");
              }}
              rows={4}
              className={`form-textarea ${feedbackError ? "error" : ""}`}
              placeholder={t(
                "workEvaluation.form.feedbackPlaceholder",
                "Provide feedback for the student..."
              )}
              required
            />
            {feedbackError && (
              <span
                className="error-message"
                style={{
                  color: "red",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                }}
              >
                {feedbackError}
              </span>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={handleReturn}
            disabled={isRequestChangesLoading || isPublishLoading}
            className="btn btn-danger"
          >
            {isRequestChangesLoading && <div className="loading-spinner"></div>}
            {t("workEvaluation.actions.return")}
          </button>
          <button
            onClick={handleAccept}
            disabled={isRequestChangesLoading || isPublishLoading}
            className="btn btn-tertiary"
          >
            {isPublishLoading && <div className="loading-spinner"></div>}
            {t("workEvaluation.actions.accept")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkEvaluation;
