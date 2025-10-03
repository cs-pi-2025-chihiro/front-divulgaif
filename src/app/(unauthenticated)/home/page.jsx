import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import i18n from "../../../i18n";
import { SearchInput } from "../../../components/input";
import Button from "../../../components/button";
import FiltrarBuscaModal from "../../../components/modal/filtrar-busca/filtrarBuscaModal";
import "./page.css";
import PaginatedResults from "../../../components/paginated-results/paginated-results";
import useSuap from "../login/useSuap";
import { pageAtom, searchAtom, sizeAtom, useHome } from "./useHome";
import { useAtom } from "jotai";
import { mapPaginationValues } from "../../../services/utils/utils";


const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [currentSize, setCurrentSize] = useAtom(sizeAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const { handleOAuthCallback } = useSuap();
  const { works, totalWorks, totalPages, isLoading, refetch } =
    useHome(appliedFilters);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    if (newSearch !== search) {
      setCurrentPage(0);
    }
  };

  const handleApplyFilters = (filters) => {
    const backendFilters = {};

    if (
      filters.workType &&
      Object.values(filters.workType).some((value) => value)
    ) {
      const selectedTypes = Object.entries(filters.workType)
        .filter(([key, value]) => value)
        .map(([key]) => key.toUpperCase());
      if (selectedTypes.length > 0) {
        backendFilters.workTypes = selectedTypes.join(",");
      }
    }

    if (filters.labels) {
      backendFilters.labels = filters.labels;
    }

    if (filters.period) {
      if (filters.period.startDate) {
        backendFilters.startDate = filters.period.startDate;
      }
      if (filters.period.endDate) {
        backendFilters.endDate = filters.period.endDate;
      }
    }

    if (filters.pagination) {
      mapPaginationValues(filters.pagination, setCurrentSize);
    }

    if (filters.order) {
      backendFilters.order = filters.order;
    }

    setCurrentPage(0);
    setAppliedFilters(backendFilters);
  };

  const handleNewWorkClick = () => {
    const currentLang = i18n.language;
    const workPath = currentLang === "pt" ? "trabalho" : "work";
    const newLang = currentLang === "pt" ? "novo" : "new";

    navigate(`/${currentLang}/${workPath}/${newLang}`);
  };

  if (error) {
    return (
      <div className="ifexplore-container">
        <div className="error-container">
          <p>{error}</p>
          <div>{t("common.retry") || "Try Again"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ifexplore-container">

      <div className="ifexplore-search-container">
        <h1 className="ifexplore-title">{t("home.welcome")}</h1>
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <SearchInput
              className="search-input"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("common.search") + "..."}
            />
          </div>
        </div>
        <div className="filter-buttons-container">
          <Button
            variant="tertiary"
            size="lg"
            className="filter-btn"
            onClick={() => setIsFilterModalOpen(true)}
          >
            {t("common.filter")}
          </Button>
          <Button
            variant="tertiary"
            size="lg"
            className="filter-btn"
            onClick={handleNewWorkClick}
          >
            <span className="icon">+</span> {t("home.newWork")}
          </Button>
        </div>
      </div>

      <PaginatedResults
        content={works}
        totalPages={totalPages}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalElements={totalWorks}
        refetch={refetch}
      />

      <FiltrarBuscaModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        setSize={setCurrentSize}
      />
    </div>
  );
};

export default Home;
