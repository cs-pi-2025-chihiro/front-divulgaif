import React, { useState, useEffect, useRef } from "react";
import Modal from "../modal";
import Button from "../../button";
import "./filtrarBuscaModal.css";
import { Input } from "../../input";

const FiltrarBuscaModal = ({ isOpen, onClose, onApplyFilters }) => {
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
        aria-label="Voltar sem aplicar filtros"
      >
        Voltar
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleApply}
        className="modal-btn modal-apply-btn"
        aria-label="Aplicar filtros de busca"
      >
        Aplicar
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtrar Busca"
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
        aria-label="Opções de filtro de busca"
      >
        <section className="filter-section">
          <h3 className="filter-section-title" id="trabalho-heading">
            Trabalho
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
              Artigo
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
              Dissertação
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
              Pesquisa
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
              TCC
            </label>
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title" id="palavras-chave-heading">
            Palavras-chaves
          </h3>
          <Input
            type="text"
            name="palavrasChaves"
            value={filters.palavrasChaves}
            onChange={handleInputChange}
            placeholder="Pesquisar..."
            className="filter-input"
            aria-labelledby="palavras-chave-heading"
            id="palavras-chave-input"
          />
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title" id="periodo-heading">
            Período
          </h3>
          <div
            className="date-inputs"
            role="group"
            aria-labelledby="periodo-heading"
          >
            <div className="date-input-group">
              <label htmlFor="data-inicial">Data Inicial</label>
              <Input
                type="date"
                name="dataInicial"
                id="data-inicial"
                value={filters.periodo.dataInicial}
                onChange={handleInputChange}
                className="date-input"
                aria-label="Data inicial para filtrar resultados"
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="data-final">Data Final</label>
              <Input
                type="date"
                name="dataFinal"
                id="data-final"
                value={filters.periodo.dataFinal}
                onChange={handleInputChange}
                className="date-input"
                aria-label="Data final para filtrar resultados"
              />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default FiltrarBuscaModal;
