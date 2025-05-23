import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "../../../components/input";
import Button from "../../../components/button";
import FiltrarBuscaModal from "../../../components/modal/filtrar-busca/filtrarBuscaModal";
import FiltrarApresentacaoModal from "../../../components/modal/filtrar-apresentacao/filtrarApresentacaoModal";
import "./page.css";
import mockedValues from "../../../data/mockedValues.json";
import PaginatedResults from "../../../components/paginated-results/paginated-results";

const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);

  const handleEdit = (id) => {
    console.log("Edit work with id:", id);
  };

  const handleView = (id) => {
    console.log("View work with id:", id);
  };

  
  console.log("Available works:", works);

  const handleApplyFilters = (filters) => {
    console.log("Applied filters:", filters);
    setActiveFilters(filters);

    let filteredWorks = [...mockedValues.trabalhos];

    // lógica para filtros de busca
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

    // lógica para filtros de apresentação
    if (filters.date.recent) {
      filteredWorks.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filters.date.older) {
      filteredWorks.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (filters.pagelimit.twelve) {
      filteredWorks = filteredWorks.slice(0, 12);
    } else if (filters.pagelimit.twentyfour) {
      filteredWorks = filteredWorks.slice(0, 24);
    } else if (filters.pagelimit.thirtysix) {
      filteredWorks = filteredWorks.slice(0, 36);
    }
    
    setWorks(filteredWorks);
  };

  return (
    <div className="ifexplore-container">
      <div className="ifexplore-search-container">
        <h1 className="ifexplore-title">{t("home.welcome")}</h1>
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <SearchInput
              className="search-input"
              placeholder={t("common.search") + "..."}
            />
          </div>
        </div>
        <div className="filter-buttons-container">
          <Button
            variant="tertiary"
            size="md"
            className="filter-btn"
            onClick={() => setIsFilterModalOpen(true)}
          >
            {t("common.filter")}
          </Button>
          <Button variant="tertiary" size="md" className="filter-btn" onClick={() => setIsPresentationModalOpen(true)}>
            {t("filters.title")}
          </Button>
        </div>
        <div className="new-work-container">
          <Button variant="tertiary" size="lg" className="new-work-btn">
            <span className="icon">📄</span> {t("home.newWork")}
          </Button>
        </div>
      </div>
      <div className="ifexplore-results">
        <div className="results-header">
          <h2 className="results-title">
            {works.length} {t("home.results")}
          </h2>
          <div className="pagination-controls">
            <button
              className="pagination-button prev"
              aria-label={t("home.previous")}
            >
              &lt;
            </button>
            <button
              className="pagination-button next"
              aria-label={t("home.next")}
            >
              &gt;
            </button>
          </div>
        </div>
        <div className="work-cards-container">
          {works.map((work) => (
            <WorkCard
              key={work.id}
              id={work.id} 
              title={work.title}
              authors={work.authors}
              description={work.description}
              labels={work.labels}
              date={work.date}
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

      <FiltrarApresentacaoModal
        isOpen={isPresentationModalOpen}
        onClose={() => setIsPresentationModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default Home;