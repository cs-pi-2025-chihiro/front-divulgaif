import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import StatCard from "../StatCard";
import BarListCard from "../BarListCard";
import DashboardFilter from "../DashboardFilter/DashboardFilter";
import "./DetailedAnalysis.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Tag,
  User,
} from "lucide-react";
import {
  searchLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from "../../../services/labels/list";

import Button from "../../../components/button";
import { SearchInput } from "../../../components/input";
import LabelModal from "../../../components/modal/label-modal/LabelModal";

import { ENDPOINTS } from "../../../enums/endpoints";
import "../../../app/(authenticated)/teacher/manage-labels/ManageLabels.css";
import AuthorsManagement from "../../../app/(authenticated)/teacher/dashboard/authors/page";

const DetailedAnalysis = ({
  activeDetailView,
  onToggleDetailView,
  isDetailedLoading,
  detailedStats,
  detailedList,
}) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const LABELS_QUERY_KEY = "dashboard_labels";

  const DEFAULT_PAGE_SIZE = 20;

  // Common state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Labels state
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(null);
  const [labelModalMode, setLabelModalMode] = useState("create");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Labels query
  const {
    data: labelsData,
    isLoading: isLabelsGridLoading,
    error: labelsGridError,
    isFetching: isLabelsGridFetching,
  } = useQuery({
    queryKey: [LABELS_QUERY_KEY, currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => searchLabels(debouncedSearchTerm, currentPage, pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    enabled: activeDetailView === "labels",
  });

  const labels = labelsData?.content ?? [];
  const totalLabelsPages = labelsData?.totalPages ?? 0;
  const totalLabels = labelsData?.totalElements ?? 0;
  const labelsPageNumber = labelsData?.number ?? 0;

  // Dynamic values for labels view
  const totalPages = totalLabelsPages;
  const pageNumber = labelsPageNumber;

  // Label mutations
  const createLabelMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_LABELS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
      closeLabelModal();
    },
    onError: (err) => {
      console.error("Failed to create label:", err);
      alert(
        t("labels.errors.createFailed", "Failed to create label: ") +
          err.message
      );
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: (labelData) => updateLabel(labelData.id, labelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_LABELS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
      closeLabelModal();
    },
    onError: (err) => {
      console.error("Failed to update label:", err);
      alert(
        t("labels.errors.updateFailed", "Failed to update label: ") +
          err.message
      );
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: deleteLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_LABELS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
    },
    onError: (err) => {
      console.error("Failed to delete label:", err);
      alert(
        t("labels.errors.deleteFailed", "Failed to delete label: ") +
          err.message
      );
    },
  });

  // Handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0);
  };

  // Label handlers
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
      createLabelMutation.mutate(labelData);
    } else {
      updateLabelMutation.mutate(labelData);
    }
  };

  const handleDeleteLabel = (labelId) => {
    if (
      window.confirm(
        t("labels.confirmDelete", "Are you sure you want to delete this label?")
      )
    ) {
      deleteLabelMutation.mutate(labelId);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Reset page when switching views
  React.useEffect(() => {
    setCurrentPage(0);
    setSearchTerm("");
  }, [activeDetailView]);

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

        <div className="detailed-stats-grid">
          <DashboardFilter
            activeView={activeDetailView}
            onToggle={onToggleDetailView}
          />
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
          ) : (
            <>
              <StatCard
                status={t("dashboard.stats.quantityOfAuthors")}
                total={quantityStatTotal}
                icon="Users"
              />
              <StatCard
                status={t("dashboard.stats.internos")}
                total={detailedStats?.internalAuthorsCount || 0}
                icon="UserCheck"
              />
              <StatCard
                status={t("dashboard.stats.externos")}
                total={detailedStats?.externalAuthorsCount || 0}
                icon="Globe"
              />
            </>
          )}
        </div>

        <div className="detailed-chart-container">
          {activeDetailView === "authors" ? (
            <AuthorsManagement />
          ) : (
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
          )}
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
