import React, { useState } from "react";
import Button from "../button";
import WorkCard from "../card/work-card";
import "./paginated-results.css";
import { useTranslation } from "react-i18next";
import { PAGE_SIZE } from "../../constants";

const PaginatedResults = ({
  content = [],
  totalPages,
  isLoading = false,
  currentPage,
  setCurrentPage,
  totalElements,
  refetch,
}) => {
  const { t } = useTranslation();

  const pageSize = PAGE_SIZE;

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      refetch();
    }
  };

  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
    refetch();
  };

  const LoadingCard = () => (
    <div className="loading-card">
      <div className="loading-image"></div>
      <div className="loading-content">
        <div className="loading-title"></div>
        <div className="loading-authors"></div>
        <div className="loading-description"></div>
        <div className="loading-description"></div>
      </div>
    </div>
  );

  return (
    <div className="ifexplore-results">
      <div className="results-header">
        <h2
          className="results-title"
          aria-label={t("pagination.resultsFound", { count: totalElements })}
        >
          {totalElements} {t("pagination.results")}
        </h2>
        <div className="pagination-controls">
          <Button
            variant="outline"
            pageSize="sm"
            typeFormat="rounded"
            className="pagination-button prev"
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            aria-label={t("pagination.previousPage")}
          >
            &lt;
          </Button>
          <span
            className="pagination-info"
            aria-label={t("pagination.currentPage", {
              current: currentPage + 1,
              total: totalPages,
            })}
          >
            {t("pagination.page")} {currentPage + 1} {t("pagination.of")}{" "}
            {totalPages}
          </span>
          <Button
            variant="outline"
            pageSize="sm"
            typeFormat="rounded"
            className="pagination-button next"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages - 1}
            aria-label={t("pagination.nextPage")}
          >
            &gt;
          </Button>
        </div>
      </div>
      <div className="work-cards-container">
        {isLoading
          ? Array.from({ length: pageSize }).map((_, index) => (
              <LoadingCard key={`loading-${index}`} />
            ))
          : content.map((work) => (
              <WorkCard
                key={work.id}
                id={work.id}
                title={work.title}
                authors={work.authors}
                description={work.description}
                labels={work.labels}
                date={work.date}
                imageUrl={work.imageUrl}
              />
            ))}
      </div>
    </div>
  );
};

export default PaginatedResults;
