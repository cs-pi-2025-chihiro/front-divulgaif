import React, { useState, useEffect, useRef } from "react";
import Modal from "../modal";
import Button from "../../button";
import "./filtrarApresentacaoModal.css";
import { Input } from "../../input";

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
      title="Filtrar Apresentação"
      className="filtrar-apresentacao-modal"
      footer={modalFooter}
      width="medium"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >

      <div
        className="filtrar-apresentacao-content"
        role="region"
        aria-label="Opções de filtro de busca"
      >
        <section className="filter-section">
          <h3 className="filter-section-title" id="date-heading">
            Ordenar por data
          </h3>
          <div
            className="checkbox-group"
            role="group"
            aria-labelledby="date-heading"
          >
            <label className="checkbox-label">
              <Input
                type="checkbox"
                checked={filters.date.recent}
                onChange={() => handleCheckboxChange("date", "recent")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "date", "recent")}
                className="filter-checkbox"
                ref={initialFocusRef}
                aria-checked={filters.date.recent}
                id="date-recent"
              />
              Mais recentes
            </label>
            <label className="checkbox-label">
              <Input
                type="checkbox"
                checked={filters.date.older}
                onChange={() => handleCheckboxChange("date", "older")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "date", "older")}
                className="filter-checkbox"
                aria-checked={filters.date.older}
                id="date-older"
              />
              Mais antigos
            </label>
          </div>
        </section>

        <section className="filter-section">
          <h3 className="filter-section-title" id="page-limit-heading">
            Limite por página
          </h3>
          <div
            className="checkbox-group"
            role="group"
            aria-labelledby="page-limit-heading"
          >
            <label className="checkbox-label">
              <Input
                type="checkbox"
                checked={filters.pagelimit.twelve}
                onChange={() => handleCheckboxChange("pagelimit", "twelve")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "pagelimit", "twelve")} 
                className="filter-checkbox"
                aria-checked={filters.pagelimit.twelve}
                id="page-limit-12"
              />
              12 trabalhos
            </label>
            <label className="checkbox-label">
              <Input
                type="checkbox"
                checked={filters.pagelimit.twentyfour}
                onChange={() => handleCheckboxChange("pagelimit", "twentyfour")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "pagelimit", "twentyfour")} 
                className="filter-checkbox"
                aria-checked={filters.pagelimit.twentyfour}
                id="page-limit-24"
              />
              24 trabalhos
            </label>
            <label className="checkbox-label">
              <Input
                type="checkbox"
                checked={filters.pagelimit.thirtysix}
                onChange={() => handleCheckboxChange("pagelimit", "thirtysix")}
                onKeyDown={(e) => handleCheckboxKeyDown(e, "pagelimit", "thirtysix")} 
                className="filter-checkbox"
                aria-checked={filters.pagelimit.thirtysix}
                id="page-limit-36"
              />
              36 trabalhos
            </label>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default FiltrarApresentacaoModal;
