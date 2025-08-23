import React, { useState, useRef } from "react";
import "./filtrarBuscaModal.css";
import { t } from "i18next";
import Button from "../../button";
import { Input } from "../../input";

const FiltrarBuscaModal = ({ isOpen, onClose, onApplyFilters, showStatus }) => {
  const initialFocusRef = useRef(null);
  const returnFocusRef = useRef(null);
  const [newLabel, setNewLabel] = useState("");
  const [localFilters, setLocalFilters] = useState({
    workType: {
      article: false,
      search: false,
      dissertation: false,
      extension: false,
      final_thesis: false,
    },
    workStatus: {
      draft: false,
      submitted: false,
      rejected: false,
      pending_changes: false,
    },
    period: {
      startDate: "",
      endDate: "",
    },
    order: "",
    pagination: "",
    labels: [],
  });

  const filterConfigs = {
    workStatus: {
      title: "filters.workStatus",
      options: {
        draft: "workStatus.draft",
        submitted: "workStatus.submitted",
        rejected: "workStatus.rejected",
        pending_changes: "workStatus.pendingChanges",
      },
    },
    workType: {
      title: "filters.workType",
      options: {
        article: "workTypes.article",
        search: "workTypes.research",
        dissertation: "workTypes.dissertation",
        extension: "workTypes.extension",
        final_thesis: "filters.finalPaper",
      },
    },
  };

  const renderFilterGroup = (filterKey, config) => (
    <div key={filterKey}>
      <h3 className="section-title">{t(config.title)}</h3>
      <div className="tag-group">
        {Object.entries(config.options).map(
          ([optionKey, translationKey], index) => (
            <Button
              key={optionKey}
              className={`tag-button ${
                localFilters[filterKey][optionKey] ? "selected" : ""
              }`}
              onClick={() => handleCheckboxChange(filterKey, optionKey)}
              ref={
                filterKey === "workType" && optionKey === "article"
                  ? initialFocusRef
                  : null
              }
            >
              {t(translationKey)}
            </Button>
          )
        )}
      </div>
    </div>
  );

  const handleCheckboxChange = (category, option) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [category]: {
        ...prevFilters[category],
        [option]: !prevFilters[category][option],
      },
    }));
  };

  const handleRadioChange = (category, value) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [category]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      period: {
        ...prevFilters.period,
        [name]: value,
      },
    }));
  };

  const handleAddLabel = (e) => {
    if (e.key === "Enter" && newLabel.trim()) {
      const trimmedLabel = newLabel.trim();
      if (!localFilters.labels.includes(trimmedLabel)) {
        setLocalFilters((prevFilters) => ({
          ...prevFilters,
          labels: [...prevFilters.labels, trimmedLabel],
        }));
      }
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      labels: prevFilters.labels.filter((label) => label !== labelToRemove),
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      workType: {
        article: false,
        search: false,
        dissertation: false,
        extension: false,
        final_thesis: false,
      },
      period: {
        startDate: "",
        endDate: "",
      },
      order: "",
      pagination: "eight",
      labels: [],
    };

    if (showStatus) {
      clearedFilters.workStatus = {
        draft: false,
        submitted: false,
        rejected: false,
        pending_changes: false,
      };
    }

    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-content">
          <section className="filter-section">
            {showStatus &&
              renderFilterGroup("workStatus", filterConfigs.workStatus)}
            {renderFilterGroup("workType", filterConfigs.workType)}
          </section>

          <section className="filter-section">
            <h3 className="section-title">{t("filters.labels")}</h3>
            <div className="labels-container">
              <Input
                type="text"
                className="label-Input"
                placeholder={t("filters.addLabel")}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={handleAddLabel}
              />
              {localFilters.labels.length > 0 && (
                <div className="labels-list">
                  {localFilters.labels.map((label, index) => (
                    <div key={index} className="label-tag">
                      <span>{label}</span>
                      <Button
                        className="remove-label-btn"
                        size="sm"
                        onClick={() => handleRemoveLabel(label)}
                        aria-label={`Remove ${label}`}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="filter-section">
            <h3 id="period-heading">{t("filters.period")}</h3>
            <div
              className="date-Inputs"
              role="group"
              aria-labelledby="period-heading"
            >
              <div className="date-Input-group">
                <label htmlFor="start-date">{t("filters.startDate")}</label>
                <Input
                  type="date"
                  name="startDate"
                  id="start-date"
                  value={localFilters.period.startDate}
                  onChange={handleInputChange}
                  className="date-Input"
                  aria-label={t("filters.startDate")}
                />
              </div>
              <div className="date-Input-group">
                <label htmlFor="end-date">{t("filters.endDate")}</label>
                <Input
                  type="date"
                  name="endDate"
                  id="end-date"
                  value={localFilters.period.endDate}
                  onChange={handleInputChange}
                  className="date-Input"
                  aria-label={t("filters.endDate")}
                />
              </div>
            </div>
          </section>

          <section className="filter-section">
            <h3 className="section-title">{t("filters.order")}</h3>
            <div className="tag-group">
              <Button
                className={`tag-button ${
                  localFilters.order === "desc" ? "selected" : ""
                }`}
                onClick={() => handleRadioChange("order", "desc")}
              >
                {t("filters.recent")}
              </Button>
              <Button
                className={`tag-button ${
                  localFilters.order === "asc" ? "selected" : ""
                }`}
                onClick={() => handleRadioChange("order", "asc")}
              >
                {t("filters.older")}
              </Button>
            </div>
          </section>

          <section className="filter-section">
            <h3 className="section-title">{t("filters.page-limit")}</h3>
            <div className="pagination-options">
              <Button
                className={`pagination-btn ${
                  localFilters.pagination === "eight" ? "selected" : ""
                }`}
                onClick={() => handleRadioChange("pagination", "eight")}
              >
                {t("filters.eight")}
              </Button>
              <Button
                className={`pagination-btn ${
                  localFilters.pagination === "twelve" ? "selected" : ""
                }`}
                onClick={() => handleRadioChange("pagination", "twelve")}
              >
                {t("filters.twelve")}
              </Button>
              <Button
                className={`pagination-btn ${
                  localFilters.pagination === "twentyfour" ? "selected" : ""
                }`}
                onClick={() => handleRadioChange("pagination", "twentyfour")}
              >
                {t("filters.twentyfour")}
              </Button>
              <Button
                className={`pagination-btn ${
                  localFilters.pagination === "thirtysix" ? "selected" : ""
                }`}
                onClick={() => handleRadioChange("pagination", "thirtysix")}
              >
                {t("filters.thirtysix")}
              </Button>
            </div>
          </section>

          <div className="modal-actions">
            <Button
              variant="secondary"
              size="md"
              className="btn-secondary-btn"
              onClick={handleClearFilters}
            >
              {t("common.clearFilters") || "Clear Filters"}
            </Button>
            <Button className="btn-secondary" onClick={onClose}>
              {t("common.back")}
            </Button>
            <Button className="btn-primary-modal" onClick={handleApply}>
              {t("filters.apply")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrarBuscaModal;
