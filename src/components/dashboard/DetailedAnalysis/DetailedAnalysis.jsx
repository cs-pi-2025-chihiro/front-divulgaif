import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import StatCard from "../StatCard";
import BarListCard from "../BarListCard";
import DashboardFilter from "../DashboardFilter/DashboardFilter";
import "./DetailedAnalysis.css";
import {
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Tag,
  User,
} from "lucide-react";

import Button from "../../../components/button";
import { SearchInput } from "../../../components/input";
import LabelModal from "../../../components/modal/label-modal/LabelModal";

import "../../../app/(authenticated)/teacher/manage-labels/ManageLabels.css";
import AuthorsManagement from "../../../app/(authenticated)/teacher/dashboard/authors/page";
import LinksManagement from "../../../app/(authenticated)/teacher/dashboard/links/page";

const DetailedAnalysis = ({
  activeDetailView,
  onToggleDetailView,
  dashboardHook,
}) => {
  const { t } = useTranslation();

  const {
    isDetailedLoading,
    detailedStats,
    labels,
    totalLabelsPages,
    totalLabels,
    labelsPageNumber,
    isLabelsGridLoading,
    isLabelsGridFetching,
    labelsGridError,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    createLabel,
    updateLabel,
    deleteLabel,
  } = dashboardHook;

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(null);
  const [labelModalMode, setLabelModalMode] = useState("create");

  const totalPages = totalLabelsPages;
  const pageNumber = labelsPageNumber;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0);
  };

  const openCreateLabelModal = () => {
    setCurrentLabel(null);
    setLabelModalMode("create");
    setIsLabelModalOpen(true);
  };

  const openEditLabelModal = (label) => {
    setCurrentLabel(label);
    setLabelModalMode("edit");
    setIsLabelModalOpen(true);
  };

  const closeLabelModal = () => {
    setIsLabelModalOpen(false);
    setCurrentLabel(null);
  };

  const handleSaveLabel = (labelData) => {
    if (labelModalMode === "create") {
      createLabel(labelData);
      closeLabelModal();
    } else {
      updateLabel(labelData);
      closeLabelModal();
    }
  };

  const handleDeleteLabel = (labelId) => {
    if (
      window.confirm(
        t("labels.confirmDelete", "Are you sure you want to delete this label?")
      )
    ) {
      deleteLabel(labelId);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const quantityStatTotal =
    activeDetailView === "labels"
      ? !isLabelsGridLoading
        ? totalLabels
        : detailedStats?.quantityOfLabels || 0
      : detailedStats?.internalAuthorsCount +
          detailedStats?.externalAuthorsCount || 0;

  return (
    <div className="detailed-analysis">
      <div className="dashboard-expanded-section">
        <h2 className="expanded-section-title">
          {t("dashboard.detailedAnalysis")}
        </h2>

        <DashboardFilter
          activeView={activeDetailView}
          onToggle={onToggleDetailView}
        />

        {activeDetailView !== "links" && (
          <div className="detailed-stats-grid">
            {isDetailedLoading ? (
              <div className="dashboard-loading">
                <div className="dashboard-loading-text">
                  {activeDetailView === "authors"
                    ? t("dashboard.loadingAuthors")
                    : t("dashboard.loadingLabels")}
                </div>
              </div>
            ) : activeDetailView === "authors" ? (
              <>
                <StatCard
                  status={t("dashboard.stats.internos")}
                  total={detailedStats?.internalAuthorsCount || 0}
                  icon="Users"
                />
                <StatCard
                  status={t("dashboard.stats.externos")}
                  total={detailedStats?.externalAuthorsCount || 0}
                  icon="Globe"
                />
                <StatCard
                  status={t("dashboard.stats.mostCited")}
                  total={detailedStats?.mostCitedAuthor || "-"}
                  icon="Trophy"
                />
              </>
            ) : activeDetailView === "labels" ? (
              <>
                <StatCard
                  status={t("dashboard.stats.quantityOfLabels")}
                  total={quantityStatTotal}
                  icon="Tag"
                />
                <StatCard
                  status={t("dashboard.stats.mostUsedLabel")}
                  total={detailedStats?.mostUsedLabel || "-"}
                  icon="TrendingUp"
                />
                <StatCard
                  status={t("dashboard.stats.leastUsedLabel")}
                  total={detailedStats?.leastUsedLabel || "-"}
                  icon="TrendingDown"
                />
              </>
            ) : null}
          </div>
        )}

        <div className="detailed-chart-container">
          {activeDetailView === "authors" ? (
            <AuthorsManagement />
          ) : activeDetailView === "labels" ? (
            <div className="labels-crud-container">
              <div className="labels-controls">
                <div className="search-wrapper">
                  <SearchInput
                    placeholder={t(
                      "labels.searchPlaceholder",
                      "Search labels..."
                    )}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="labels-search-input"
                  />
                </div>
                <Button
                  onClick={openCreateLabelModal}
                  variant="primary"
                  size="md"
                  style={{ backgroundColor: "#3A664B", borderColor: "#3A664B" }}
                >
                  <Plus size={18} /> {t("labels.addNew", "Add New Label")}
                </Button>
              </div>

              {(isLabelsGridLoading || isLabelsGridFetching) && (
                <p>{t("common.loading", "Loading...")}</p>
              )}
              {labelsGridError && (
                <p className="error-message">
                  {t("labels.errors.loadFailed", "Failed to load labels: ")}
                  {labelsGridError.message}
                </p>
              )}

              {!isLabelsGridLoading && !labelsGridError && (
                <>
                  <div className="labels-grid">
                    {labels.length > 0 ? (
                      labels.map((label) => (
                        <div key={label.id} className="label-card">
                          <div className="label-card-content">
                            <Tag size={20} className="label-icon" />
                            <div>
                              <div className="label-name">{label.name}</div>
                              {label.workCount !== undefined && (
                                <div className="label-count">
                                  ({label.workCount})
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="label-card-actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditLabelModal(label)}
                              aria-label={t("common.edit")}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLabel(label.id)}
                              aria-label={t("common.delete")}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>{t("labels.noLabelsFound", "No labels found.")}</p>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination-controls-labels">
                      <span>
                        {t("pagination.page", "Page")} {pageNumber + 1}{" "}
                        {t("pagination.of", "of")} {totalPages} ({totalLabels}{" "}
                        {t("labels.total", "labels")})
                      </span>
                      <div>
                        <Button
                          onClick={handlePreviousPage}
                          disabled={
                            currentPage === 0 ||
                            isLabelsGridLoading ||
                            isLabelsGridFetching
                          }
                          variant="secondary"
                          size="sm"
                          aria-label={t("pagination.previousPage")}
                        >
                          <ChevronLeft size={18} />
                        </Button>
                        <Button
                          onClick={handleNextPage}
                          disabled={
                            currentPage >= totalPages - 1 ||
                            isLabelsGridLoading ||
                            isLabelsGridFetching
                          }
                          variant="secondary"
                          size="sm"
                          aria-label={t("pagination.nextPage")}
                        >
                          <ChevronRight size={18} />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeDetailView === "links" ? (
            <LinksManagement />
          ) : null}
        </div>
      </div>

      <LabelModal
        isOpen={isLabelModalOpen}
        onClose={closeLabelModal}
        onSave={handleSaveLabel}
        labelData={currentLabel}
        mode={labelModalMode}
      />
    </div>
  );
};

export default DetailedAnalysis;
