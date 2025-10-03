import React, { useState, useEffect } from "react";
import { Filter, Plus } from "lucide-react";
import "./page.css";
import {
  navigateTo,
  mapPaginationValues,
} from "../../../../services/utils/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import FiltrarBuscaModal from "../../../../components/modal/filtrar-busca/filtrarBuscaModal";
import { pageAtom, searchAtom, sizeAtom, useMyWorks } from "./useMyWorks";
import PaginatedResults from "../../../../components/paginated-results/paginated-results";
import { useAtom } from "jotai";
import { SearchInput } from "../../../../components/input";
import Button from "../../../../components/button";


const MyWorks = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [currentSize, setCurrentSize] = useAtom(sizeAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const { works, totalPages, totalWorks, isLoading, refetch } =
    useMyWorks(appliedFilters);

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

    if (
      filters.workStatus &&
      Object.values(filters.workStatus).some((value) => value)
    ) {
      const selectedTypes = Object.entries(filters.workStatus)
        .filter(([key, value]) => value)
        .map(([key]) => key.toUpperCase());
      if (selectedTypes.length > 0) {
        backendFilters.workStatus = selectedTypes.join(",");
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
    setIsFilterModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".filter-dropdown")) {
        setIsFilterModalOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    if (newSearch !== search) {
      setCurrentPage(0);
    }
  };

  const handleNovoTrabalho = () => {
    const newWorkPath = currentLang === "pt" ? "trabalho/novo" : "work/new";
    navigateTo(newWorkPath, navigate, currentLang);
  };

  return (
    <div className="container">

      <div className="main-content">
        <div
          className="filters-section"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h1 className="results-title">{t("header.myWorks")}</h1>
        </div>

        <div className="filters-section">
          <div className="filter-dropdown">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterModalOpen(!isFilterModalOpen);
              }}
              className="filter-button"
              size="2lg"
            >
              <Filter className="icon" />
              <span>{t("filters.filterSearch")}</span>
            </Button>
          </div>

          <Button
            onClick={handleNovoTrabalho}
            className="new-work-button"
            size="2lg"
          >
            <Plus className="icon" />
            {t("home.newWork")}
          </Button>
        </div>
        <div className="search-input-wrapper">
          <SearchInput
            className="search-input"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("common.search") + "..."}
          />
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
        showStatus={true}
        setSize={setCurrentSize}
      />
    </div>
  );
};

export default MyWorks;
