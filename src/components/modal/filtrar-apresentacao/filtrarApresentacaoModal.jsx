import React, { useState, useEffect, useRef } from "react";
import Modal from "../modal";
import Button from "../../button";
import "./filtrarApresentacaoModal.css";
import { Input } from "../../input";
import { useTranslation } from "react-i18next";

const FiltrarApresentacaoModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    date: {
      recent: true,
      older: false,
    },
    pagelimit: {
      twelve: false,
      twentyfour: true,
      thirtysix: false,
    },
  });
  
  const initialFocusRef = useRef(null);
  const { t, i18n } = useTranslation();
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      setTimeout(() => {
        initialFocusRef.current.focus();
      }, 100);
    }

    if (isOpen) {
      returnFocusRef.current = document.activeElement;
    } else if (returnFocusRef.current) {
      returnFocusRef.current.focus();
    }
  }, [isOpen]);

  const handleCheckboxChange = (category, item) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        recent: category === "date" && item === "recent",
        older: category === "date" && item === "older",
        twelve: category === "pagelimit" && item === "twelve",
        twentyfour: category === "pagelimit" && item === "twentyfour",
        thirtysix: category === "pagelimit" && item === "thirtysix",
      },
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleCheckboxKeyDown = (e, category, item) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCheckboxChange(category, item);
    }
  };

  const modalFooter = (
    <>
      <Button
        variant="secondary"
        size="md"
        onClick={onClose}
        className="modal-btn modal-cancel-btn"
        aria-label="Voltar sem aplicar filtros"
      >
        {t("filters.back")}
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleApply}
        className="modal-btn modal-apply-btn"
        aria-label="Aplicar filtros de busca"
      >
        {t("filters.apply")}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("filters.title")}
      className="filtrar-apresentacao-modal"
      footer={modalFooter}
      width="medium"
      role="dialog"
      aria-modal="true"
      aria-labelledby={t("filters.title")}
      onKeyDown={handleKeyDown}
    >
      <div
        className="filtrar-apresentacao-content"
        role="region"
        aria-label="Opções de filtro de busca"
      >
        <section className="filter-section">
          <h3 className="filter-section-title" id="date-heading">
            {t("filters.filterDate")}
          </h3>
          <div
            className="radio-group"
            role="radiogroup"
            aria-labelledby="date-heading"
          >
            <label className="radio-label">
              <Input
                type="radio"
                name="date"
                checked={filters.date.recent}
                onChange={() => handleCheckboxChange("date", "recent")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "date", "recent")}
                className="filter-radio"
                aria-checked={filters.date.recent}
                id="date-recent"
              />
              {t("filters.recent")}
            </label>
            <label className="radio-label">
              <Input
                type="radio"
                name="date"
                checked={filters.date.older}
                onChange={() => handleCheckboxChange("date", "older")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "date", "older")}
                className="filter-radio"
                aria-checked={filters.date.older}
                id="date-older"
              />
              {t("filters.older")}
            </label>
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title" id="page-limit-heading">
          {t("filters.page-limit")}
          </h3>
          <div
            className="radio-group"
            role="radiogroup"
            aria-labelledby="page-limit-heading"
          >
            <label className="radio-label">
              <Input
                type="radio"
                name="pagelimit"
                checked={filters.pagelimit.twelve}
                onChange={() => handleCheckboxChange("pagelimit", "twelve")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "pagelimit", "twelve")}
                className="filter-radio"
                aria-checked={filters.pagelimit.twelve}
                id="page-limit-12"
              />
              {t("filters.twelve")}
              
            </label>
            <label className="radio-label">
              <Input
                type="radio"
                name="pagelimit"
                checked={filters.pagelimit.twentyfour}
                onChange={() => handleCheckboxChange("pagelimit", "twentyfour")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "pagelimit", "twentyfour")}
                className="filter-radio"
                aria-checked={filters.pagelimit.twentyfour}
                id="page-limit-24"
              />
              {t("filters.twentyfour")}
            </label>
            <label className="radio-label">
              <Input
                type="radio"
                name="pagelimit"
                checked={filters.pagelimit.thirtysix}
                onChange={() => handleCheckboxChange("pagelimit", "thirtysix")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "pagelimit", "thirtysix")}
                className="filter-radio"
                aria-checked={filters.pagelimit.thirtysix}
                id="page-limit-36"
              />
              {t("filters.thirtysix")}
            </label>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default FiltrarApresentacaoModal;
