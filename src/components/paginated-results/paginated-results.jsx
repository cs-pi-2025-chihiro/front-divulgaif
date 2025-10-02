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
    <div className="loading-card-new">
      <div className="loading-image"></div>
      <div className="loading-content">
        <div className="loading-title-section">
          <div className="loading-title"></div>
          <div className="loading-link"></div>
        </div>
        <div className="loading-description"></div>
        <div className="loading-authors-date">
          <div className="loading-authors"></div>
          <div className="loading-date"></div>
        </div>
        <div className="loading-labels">
          <div className="loading-label"></div>
          <div className="loading-label"></div>
          <div className="loading-label"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ifexplore-results-new">
      <div className="results-header">
        <h2
          aria-label={t("pagination.resultsFound", {
            count: totalElements,
          })}
        >
          {isLoading ? (
            <span className="loading-text">
              {t("common.loading", "Loading")}
            </span>
          ) : (
            <>
              {totalElements}{" "}
              {totalElements === 1
                ? t("pagination.result")
                : t("pagination.results")}
            </>
          )}
        </h2>{" "}
        <div className="pagination-controls">
          <Button
            variant="outline"
            pageSize="sm"
            typeFormat="rounded"
            className="pagination-button prev"
            onClick={goToPreviousPage}
            disabled={currentPage === 0 || isLoading}
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
            {isLoading ? (
              <span className="loading-text">---</span>
            ) : (
              <>
                {t("pagination.page")} {currentPage + 1} {t("pagination.of")}{" "}
                {totalPages}
              </>
            )}
          </span>
          <Button
            variant="outline"
            pageSize="sm"
            typeFormat="rounded"
            className="pagination-button next"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages - 1 || isLoading}
            aria-label={t("pagination.nextPage")}
          >
            &gt;
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="work-cards-container-new">
          {Array.from({ length: pageSize }).map((_, index) => (
            <LoadingCard key={`loading-${index}`} />
          ))}
        </div>
      ) : content.length > 0 ? (
        <div className="work-cards-container-new">
          {content.map((work) => (
            <div style={{ marginBottom: "40px" }} key={work.id}>
              <WorkCard
                key={work.id}
                id={work.id}
                title={work.title}
                authors={work.authors}
                description={work.description}
                labels={work.labels}
                approvedAt={work.approvedAt}
                imageUrl={work.imageUrl}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results-container">
          <p className="no-results-text">{t("errors.NoWorksFound")}</p>
        </div>
      )}
    </div>
  );
};

export default PaginatedResults;
