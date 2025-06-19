import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../modal";
import Button from "../../button";
import "./filtrarBuscaModal.css";
import { Input } from "../../input";

const FiltrarBuscaModal = ({ isOpen, onClose, onApplyFilters }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    trabalho: {
      artigo: false,
      dissertacao: false,
      pesquisa: false,
      tcc: false,
    },
    palavrasChaves: "",
    periodo: {
      dataInicial: "",
      dataFinal: "",
    },
  });

  const initialFocusRef = useRef(null);

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
        ...prev[category],
        [item]: !prev[category][item],
      },
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "dataInicial" || name === "dataFinal") {
      setFilters((prev) => ({
        ...prev,
        periodo: {
          ...prev.periodo,
          [name]: value,
        },
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  const modalFooter = (
    <>
      <Button
        variant="secondary"
        size="md"
        onClick={onClose}
        className="modal-btn modal-cancel-btn"
        aria-label={t('filters.back')}
      >
        {t('filters.back')}
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleApply}
        className="modal-btn modal-apply-btn"
        aria-label={t('filters.apply')}
      >
        {t('filters.apply', 'Aplicar')}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('filters.filterSearch')}
      className="filtrar-busca-modal"
      footer={modalFooter}
      width="medium"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <div
        className="filtrar-busca-content"
        role="region"
        aria-label={t('filters.filterOptions')}
      >
        <section className="filter-section">
          <h3 className="filter-section-title" id="trabalho-heading">
            {t('filters.work')}
          </h3>
          <div
            className="checkbox-group"
            role="group"
            aria-labelledby="trabalho-heading"
          >
            <label className="checkbox-label">
              <Input
                type="checkbox"
                checked={filters.trabalho.artigo}
                onChange={() => handleCheckboxChange("trabalho", "artigo")}
                className="filter-checkbox"
                ref={initialFocusRef}
                aria-checked={filters.trabalho.artigo}
                id="trabalho-artigo"
              />
              {t('filters.article')}
            </label>
            <label className="checkbox-label" htmlFor="trabalho-dissertacao">
              <Input
                type="checkbox"
                checked={filters.trabalho.dissertacao}
                onChange={() => handleCheckboxChange("trabalho", "dissertacao")}
                className="filter-checkbox"
                aria-checked={filters.trabalho.dissertacao}
                id="trabalho-dissertacao"
              />
              {t('filters.dissertation')}
            </label>
            <label className="checkbox-label" htmlFor="trabalho-pesquisa">
              <Input
                type="checkbox"
                checked={filters.trabalho.pesquisa}
                onChange={() => handleCheckboxChange("trabalho", "pesquisa")}
                className="filter-checkbox"
                aria-checked={filters.trabalho.pesquisa}
                id="trabalho-pesquisa"
              />
              {t('filters.research')}
            </label>
            <label className="checkbox-label" htmlFor="trabalho-tcc">
              <Input
                type="checkbox"
                checked={filters.trabalho.tcc}
                onChange={() => handleCheckboxChange("trabalho", "tcc")}
                className="filter-checkbox"
                aria-checked={filters.trabalho.tcc}
                id="trabalho-tcc"
              />
              {t('filters.finalPaper')}
            </label>
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title" id="palavras-chave-heading">
            {t('filters.keywords')}
          </h3>
          <Input
            type="text"
            name="palavrasChaves"
            value={filters.palavrasChaves}
            onChange={handleInputChange}
            placeholder={t('filters.searchPlaceholder')}
            className="filter-input"
            aria-labelledby="palavras-chave-heading"
            id="palavras-chave-input"
          />
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title" id="periodo-heading">
            {t('filters.period')}
          </h3>
          <div
            className="date-inputs"
            role="group"
            aria-labelledby="periodo-heading"
          >
            <div className="date-input-group">
              <label htmlFor="data-inicial">{t('filters.startDate')}</label>
              <Input
                type="date"
                name="dataInicial"
                id="data-inicial"
                value={filters.periodo.dataInicial}
                onChange={handleInputChange}
                className="date-input"
                aria-label={t('filters.startDate')}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="data-final">{t('filters.endDate')}</label>
              <Input
                type="date"
                name="dataFinal"
                id="data-final"
                value={filters.periodo.dataFinal}
                onChange={handleInputChange}
                className="date-input"
                aria-label={t('filters.endDate')}
              />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default FiltrarBuscaModal;
