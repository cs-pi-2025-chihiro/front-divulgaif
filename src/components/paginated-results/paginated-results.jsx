import React, { useEffect, useState } from "react";
import Button from "../button";
import WorkCard from "../card/work-card";
import "./paginated-results.css";
import { useTranslation } from "react-i18next";

const PaginatedResults = ({ works, isLoading = false }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useTranslation();

  const firstPageSize = 8;

  const totalPages = works.length <= firstPageSize ? 1 : 2;

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(0);
    }
  };

  const goToNextPage = () => {
    if (currentPage === 0 && works.length > firstPageSize) {
      setCurrentPage(1);
    }
  };

  const visibleWorks =
    currentPage === 0
      ? works.slice(0, firstPageSize)
      : works.slice(firstPageSize);

  const handleEdit = (id) => {};

  const handleView = (id) => {};

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
          aria-label={t("pagination.resultsFound", { count: works.length })}
        >
          {works.length} {t("pagination.results")}
        </h2>
        <div className="pagination-controls">
          <Button
            variant="outline"
            size="sm"
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
            size="sm"
            typeFormat="rounded"
            className="pagination-button next"
            onClick={goToNextPage}
            disabled={currentPage === 1 || works.length <= firstPageSize}
            aria-label={t("pagination.nextPage")}
          >
            &gt;
          </Button>
        </div>
      </div>
      <div className="work-cards-container">
        {isLoading
          ? Array.from({ length: firstPageSize }).map((_, index) => (
              <LoadingCard key={`loading-${index}`} />
            ))
          : visibleWorks.map((work) => (
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
  );
};

export default PaginatedResults;
