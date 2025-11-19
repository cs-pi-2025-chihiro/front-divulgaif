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
import {
  searchAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../../../services/authors/list";
import Button from "../../../components/button";
import { SearchInput } from "../../../components/input";
import LabelModal from "../../../components/modal/label-modal/LabelModal";
import AuthorModal from "../../../components/modal/author-modal/AuthorModal";
import { ENDPOINTS } from "../../../enums/endpoints";
import "../../../app/(authenticated)/teacher/manage-labels/ManageLabels.css";

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
  const AUTHORS_QUERY_KEY = "dashboard_authors";
  const DEFAULT_PAGE_SIZE = 20;

  // Common state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Labels state
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(null);
  const [labelModalMode, setLabelModalMode] = useState("create");

  // Authors state
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState(null);
  const [authorModalMode, setAuthorModalMode] = useState("create");

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

  // Authors query
  const {
    data: authorsData,
    isLoading: isAuthorsGridLoading,
    error: authorsGridError,
    isFetching: isAuthorsGridFetching,
  } = useQuery({
    queryKey: [AUTHORS_QUERY_KEY, currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => searchAuthors(debouncedSearchTerm, currentPage, pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    enabled: activeDetailView === "authors",
  });

  const labels = labelsData?.content ?? [];
  const totalLabelsPages = labelsData?.totalPages ?? 0;
  const totalLabels = labelsData?.totalElements ?? 0;
  const labelsPageNumber = labelsData?.number ?? 0;

  const authors = authorsData?.content ?? [];
  const totalAuthorsPages = authorsData?.totalPages ?? 0;
  const totalAuthors = authorsData?.totalElements ?? 0;
  const authorsPageNumber = authorsData?.number ?? 0;

  // Dynamic values based on active view
  const totalPages =
    activeDetailView === "labels" ? totalLabelsPages : totalAuthorsPages;
  const pageNumber =
    activeDetailView === "labels" ? labelsPageNumber : authorsPageNumber;

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

  // Author mutations
  const createAuthorMutation = useMutation({
    mutationFn: createAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_AUTHORS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
      closeAuthorModal();
    },
    onError: (err) => {
      console.error("Failed to create author:", err);
      alert(
        t("authors.errors.createFailed", "Failed to create author: ") +
          err.message
      );
    },
  });

  const updateAuthorMutation = useMutation({
    mutationFn: (authorData) => updateAuthor(authorData.id, authorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_AUTHORS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
      closeAuthorModal();
    },
    onError: (err) => {
      console.error("Failed to update author:", err);
      alert(
        t("authors.errors.updateFailed", "Failed to update author: ") +
          err.message
      );
    },
  });

  const deleteAuthorMutation = useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_AUTHORS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
    },
    onError: (err) => {
      console.error("Failed to delete author:", err);
      alert(
        t("authors.errors.deleteFailed", "Failed to delete author: ") +
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

  // Author handlers
  const openCreateAuthorModal = () => {
    setCurrentAuthor(null);
    setAuthorModalMode("create");
    setIsAuthorModalOpen(true);
  };

  const openEditAuthorModal = (author) => {
    setCurrentAuthor(author);
    setAuthorModalMode("edit");
    setIsAuthorModalOpen(true);
  };

  const closeAuthorModal = () => {
    setIsAuthorModalOpen(false);
    setCurrentAuthor(null);
  };

  const handleSaveAuthor = (authorData) => {
    if (authorModalMode === "create") {
      createAuthorMutation.mutate(authorData);
    } else {
      updateAuthorMutation.mutate(authorData);
    }
  };

  const handleDeleteAuthor = (authorId) => {
    if (
      window.confirm(
        t(
          "authors.confirmDelete",
          "Are you sure you want to delete this author?"
        )
      )
    ) {
      deleteAuthorMutation.mutate(authorId);
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
      : !isAuthorsGridLoading
      ? totalAuthors
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
            <div className="authors-crud-container">
              <div className="authors-controls">
                <div className="search-wrapper">
                  <SearchInput
                    placeholder={t(
                      "authors.searchPlaceholder",
                      "Search authors..."
                    )}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="authors-search-input"
                  />
                </div>
                <Button
                  onClick={openCreateAuthorModal}
                  variant="primary"
                  size="md"
                  style={{ backgroundColor: "#3A664B", borderColor: "#3A664B" }}
                >
                  <Plus size={18} /> {t("authors.addNew", "Add New Author")}
                </Button>
              </div>

              {(isAuthorsGridLoading || isAuthorsGridFetching) && (
                <p>{t("common.loading", "Loading...")}</p>
              )}
              {authorsGridError && (
                <p className="error-message">
                  {t("authors.errors.loadFailed", "Failed to load authors: ")}
                  {authorsGridError.message}
                </p>
              )}

              {!isAuthorsGridLoading && !authorsGridError && (
                <>
                  <div className="authors-grid">
                    {authors.length > 0 ? (
                      authors.map((author) => (
                        <div key={author.id} className="author-card">
                          <div className="author-card-content">
                            <User size={20} className="author-icon" />
                            <div>
                              <div className="author-name">{author.name}</div>
                              <div className="author-email">{author.email}</div>
                              {author.type && (
                                <div
                                  className={`author-type ${
                                    author.type?.toLowerCase() || "sem"
                                  }`}
                                >
                                  {author.type === "CADASTRADO"
                                    ? t("authors.registered")
                                    : t("authors.notRegistered")}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="author-card-actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditAuthorModal(author)}
                              aria-label={t("common.edit")}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAuthor(author.id)}
                              aria-label={t("common.delete")}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>{t("authors.noAuthorsFound", "No authors found.")}</p>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination-controls-authors">
                      <span>
                        {t("pagination.page", "Page")} {pageNumber + 1}{" "}
                        {t("pagination.of", "of")} {totalPages} ({totalAuthors}{" "}
                        {t("authors.total", "authors")})
                      </span>
                      <div>
                        <Button
                          onClick={handlePreviousPage}
                          disabled={
                            currentPage === 0 ||
                            isAuthorsGridLoading ||
                            isAuthorsGridFetching
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
                            isAuthorsGridLoading ||
                            isAuthorsGridFetching
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

      <AuthorModal
        isOpen={isAuthorModalOpen}
        onClose={closeAuthorModal}
        onSave={handleSaveAuthor}
        authorData={currentAuthor}
        mode={authorModalMode}
      />
    </div>
  );
};

export default DetailedAnalysis;
