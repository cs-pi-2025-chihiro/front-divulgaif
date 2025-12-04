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

      <div className="work-cards-container-new">
        {isLoading && (
          <div className="paginated-results-loader-overlay">
            <div className="paginated-results-spinner"></div>
          </div>
        )}
        {content.length > 0
          ? content.map((work) => (
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
            ))
          : !isLoading && (
              <div className="no-results-container">
                <div className="no-results-text">
                  {t("errors.NoWorksFound")}
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default PaginatedResults;
