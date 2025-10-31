import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save } from "lucide-react";
import "./page.css";
import { createLink } from "../../../../../services/links/list";
import Button from "../../../../../components/button";
import { navigateTo } from "../../../../../services/utils/utils";

const NewLink = () => {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title.trim()) {
      setError(t("Título necessário") || "Title is required");
      return;
    }

    if (!formData.url.trim()) {
      setError(t("common.urlRequired") || "URL is required");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch (err) {
      setError(t("common.invalidUrl") || "Invalid URL format");
      return;
    }

    setIsLoading(true);
    try {
      await createLink({
        title: formData.title.trim(),
        url: formData.url.trim(),
      });
      setSuccess(true);
      setFormData({ title: "", url: "" });
      
      // Redirect to links page after 1.5 seconds
      setTimeout(() => {
        const linksPath = currentLang === "pt" ? "links" : "links";
        navigateTo(linksPath, navigate, currentLang);
      }, 1500);
    } catch (err) {
      setError(
        err.message || t("common.errorCreating") || "Error creating link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const linksPath = currentLang === "pt" ? "links" : "links";
    navigateTo(linksPath, navigate, currentLang);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">{t("common.newLink") || "New Link"}</h1>
        <p className="form-description">
          {t("common.newLinkDescription") ||
            "Create a new link to share with your students"}
        </p>
      </div>

      {success && (
        <div className="success-message">
          {t("common.linkCreated") || "Link created successfully!"}
        </div>
      )}

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            {t("common.title") || "Title"}
            <span style={{ color: "#dc3545" }}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={t("common.enterTitle") || "Enter link title"}
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="url" className="form-label">
            {t("common.url") || "URL"}
            <span style={{ color: "#dc3545" }}>*</span>
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder={t("common.enterUrl") || "https://example.com"}
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="form-button cancel-button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <ArrowLeft size={18} />
            {t("common.cancel" ) || "Cancel"}
          </button>
          <button
            type="submit"
            className="form-button submit-button"
            disabled={isLoading}
          >
            <Save size={18} />
            {isLoading
              ? t("common.saving") || "Saving..."
              : t("common.save") || "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewLink;
