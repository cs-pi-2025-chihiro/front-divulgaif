import React, { useState } from "react";
import { SearchInput } from "../../../components/input";
import Button from "../../../components/button";
import FiltrarBuscaModal from "../../../components/modal/filtrar-busca/filtrarBuscaModal";
import "./page.css";
import mockedValues from "../../../data/mockedValues.json";
import WorkCard from "../../../components/card/work-card/index";

const Home = () => {
  const [works, setWorks] = useState(mockedValues.trabalhos);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
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

  const handleEdit = (id) => {
    console.log("Edit work with id:", id);
    // Implement edit logic
  };

  const handleView = (id) => {
    console.log("View work with id:", id);
  };

  const handleApplyFilters = (filters) => {
    console.log("Applied filters:", filters);
    setActiveFilters(filters);

    let filteredWorks = [...mockedValues.trabalhos];

    if (Object.values(filters.trabalho).some((value) => value)) {
      filteredWorks = filteredWorks.filter((work) => {
        return filters.trabalho[work.type.toLowerCase()];
      });
    }

    if (filters.palavrasChaves.trim()) {
      const keywords = filters.palavrasChaves
        .split(";")
        .map((k) => k.trim().toLowerCase());
      filteredWorks = filteredWorks.filter((work) => {
        return keywords.some(
          (keyword) =>
            work.title.toLowerCase().includes(keyword) ||
            work.description.toLowerCase().includes(keyword)
        );
      });
    }

    if (filters.periodo.dataInicial || filters.periodo.dataFinal) {
      filteredWorks = filteredWorks.filter((work) => {
        const workDate = new Date(work.date);
        let isValid = true;

        if (filters.periodo.dataInicial) {
          const startDate = new Date(filters.periodo.dataInicial);
          isValid = isValid && workDate >= startDate;
        }

        if (filters.periodo.dataFinal) {
          const endDate = new Date(filters.periodo.dataFinal);
          isValid = isValid && workDate <= endDate;
        }

        return isValid;
      });
    }

    setWorks(filteredWorks);
  };

  return (
    <div className="ifexplore-container">
      <div className="ifexplore-search-container">
        <h1 className="ifexplore-title">IF Xplore</h1>
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <SearchInput className="search-input" placeholder="Pesquisar..." />
          </div>
        </div>
        <div className="filter-buttons-container">
          <Button
            variant="tertiary"
            size="md"
            className="filter-btn"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filtrar Busca
          </Button>
          <Button variant="tertiary" size="md" className="filter-btn">
            Filtrar Apresentação
          </Button>
        </div>
        <div className="new-work-container">
          <Button variant="tertiary" size="lg" className="new-work-btn">
            <span className="icon">📄</span> Novo Trabalho
          </Button>
        </div>
      </div>
      <div className="ifexplore-results">
        <div className="results-header">
          <h2 className="results-title">{works.length} Resultados</h2>
          <div className="pagination-controls">
            <button className="pagination-button prev">&lt;</button>
            <button className="pagination-button next">&gt;</button>
          </div>
        </div>
        <div className="work-cards-container">
          {works.map((work) => (
            <WorkCard
              key={work.id}
              title={work.title}
              authors={work.authors}
              description={work.description}
              imageUrl={work.imageUrl}
              onEdit={() => handleEdit(work.id)}
              onView={() => handleView(work.id)}
            />
          ))}
        </div>
      </div>

      <FiltrarBuscaModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default Home;
