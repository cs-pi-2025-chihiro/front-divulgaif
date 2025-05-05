import React, { useState } from "react";
import Modal from "../modal";
import Button from "../../button";
import "./filtrarBuscaModal.css";

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

  const modalFooter = (
    <>
      <Button
        variant="secondary"
        size="md"
        onClick={onClose}
        className="modal-btn modal-cancel-btn"
      >
        Voltar
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleApply}
        className="modal-btn modal-apply-btn"
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
    >
      <div className="filtrar-busca-content">
        <section className="filter-section">
          <h3 className="filter-section-title">Trabalho</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.trabalho.artigo}
                onChange={() => handleCheckboxChange("trabalho", "artigo")}
                className="filter-checkbox"
              />
              Artigo
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.trabalho.dissertacao}
                onChange={() => handleCheckboxChange("trabalho", "dissertacao")}
                className="filter-checkbox"
              />
              Dissertação
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.trabalho.pesquisa}
                onChange={() => handleCheckboxChange("trabalho", "pesquisa")}
                className="filter-checkbox"
              />
              Pesquisa
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.trabalho.tcc}
                onChange={() => handleCheckboxChange("trabalho", "tcc")}
                className="filter-checkbox"
              />
              TCC
            </label>
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Palavras-chaves</h3>
          <input
            type="text"
            name="palavrasChaves"
            value={filters.palavrasChaves}
            onChange={handleInputChange}
            placeholder="Palavra1; Palavra2; Palavra3"
            className="filter-input"
          />
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title">Período</h3>
          <div className="date-inputs">
            <div className="date-input-group">
              <label>Data Inicial</label>
              <input
                type="date"
                name="dataInicial"
                value={filters.periodo.dataInicial}
                onChange={handleInputChange}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>Data Final</label>
              <input
                type="date"
                name="dataFinal"
                value={filters.periodo.dataFinal}
                onChange={handleInputChange}
                className="date-input"
              />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default FiltrarBuscaModal;
