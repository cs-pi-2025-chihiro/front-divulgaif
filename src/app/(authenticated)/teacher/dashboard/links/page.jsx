import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import {
  searchLinks,
  createLink,
  updateLink,
  deleteLink,
} from "../../../../../services/links/list";
import Button from "../../../../../components/button";
import { SearchInput } from "../../../../../components/input";
import "./page.css";

const LINKS_QUERY_KEY = "dashboard_links";
const DEFAULT_PAGE_SIZE = 20;

const LinksManagement = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [formData, setFormData] = useState({ title: "", url: "" });
  const [formErrors, setFormErrors] = useState({});

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: linksData,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: [LINKS_QUERY_KEY, currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => searchLinks(debouncedSearchTerm, currentPage, pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  const links = linksData?.content ?? [];
  const totalPages = linksData?.totalPages ?? 0;
  const totalLinks = linksData?.totalElements ?? 0;

  const createLinkMutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LINKS_QUERY_KEY] });
      closeModal();
    },
    onError: (err) => {
      console.error("Failed to create link:", err);
      alert(t("links.errors.createFailed", "Failed to create link: ") + err.message);
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, data }) => updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LINKS_QUERY_KEY] });
      closeModal();
    },
    onError: (err) => {
      console.error("Failed to update link:", err);
      alert(t("links.errors.updateFailed", "Failed to update link: ") + err.message);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LINKS_QUERY_KEY] });
    },
    onError: (err) => {
      console.error("Failed to delete link:", err);
      alert(t("links.errors.deleteFailed", "Failed to delete link: ") + err.message);
    },
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = t("links.errors.titleRequired", "Title is required");
    }
    if (!formData.url.trim()) {
      errors.url = t("links.errors.urlRequired", "URL is required");
    } else {
      try {
        new URL(formData.url);
      } catch {
        errors.url = t("links.errors.invalidUrl", "Invalid URL format");
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0);
  };

  const openCreateModal = () => {
    setCurrentLink(null);
    setModalMode("create");
    setFormData({ title: "", url: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (link) => {
    setCurrentLink(link);
    setModalMode("edit");
    setFormData({ title: link.title, url: link.url });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLink(null);
    setFormData({ title: "", url: "" });
    setFormErrors({});
  };

  const handleSaveLink = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalMode === "create") {
      createLinkMutation.mutate(formData);
    } else {
      updateLinkMutation.mutate({ id: currentLink.id, data: formData });
    }
  };

  const handleDeleteLink = (linkId) => {
    if (
      window.confirm(
        t("links.confirmDelete", "Are you sure you want to delete this link?")
      )
    ) {
      deleteLinkMutation.mutate(linkId);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="links-management-container">
      <div className="links-controls">
        <div className="search-wrapper">
          <SearchInput
            placeholder={t("links.searchPlaceholder", "Search links...")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="links-search-input"
          />
        </div>
        <Button
          onClick={openCreateModal}
          variant="primary"
          size="md"
          style={{ backgroundColor: "#3A664B", borderColor: "#3A664B" }}
        >
          <Plus size={18} /> {t("links.addNew", "Add New Link")}
        </Button>
      </div>

      {(isLoading || isFetching) && <p>{t("common.loading", "Loading...")}</p>}
      {error && (
        <p className="error-message">
          {t("links.errors.loadFailed", "Failed to load links: ")}
          {error.message}
        </p>
      )}

      {!isLoading && !error && (
        <>
          <div className="links-grid">
            {links.length > 0 ? (
              links.map((link) => (
                <div key={link.id} className="link-card">
                  <div className="link-card-content">
                    <LinkIcon size={20} className="link-icon" />
                    <div className="link-info">
                      <div className="link-title">{link.title}</div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-url"
                      >
                        {link.url} <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  <div className="link-card-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(link)}
                      aria-label={t("common.edit")}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      aria-label={t("common.delete")}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p>{t("links.noLinksFound", "No links found.")}</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls-links">
              <span>
                {t("pagination.page", "Page")} {currentPage + 1}{" "}
                {t("pagination.of", "of")} {totalPages} ({totalLinks}{" "}
                {t("links.total", "links")})
              </span>
              <div>
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0 || isLoading || isFetching}
                  variant="secondary"
                  size="sm"
                  aria-label={t("pagination.previousPage")}
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1 || isLoading || isFetching}
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalMode === "create"
                ? t("links.createTitle", "Create New Link")
                : t("links.editTitle", "Edit Link")}
            </h3>
            <form onSubmit={handleSaveLink}>
              <div className="form-group">
                <label htmlFor="link-title">
                  {t("links.form.title", "Title")} *
                </label>
                <input
                  id="link-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={formErrors.title ? "error" : ""}
                />
                {formErrors.title && (
                  <span className="error-text">{formErrors.title}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="link-url">{t("links.form.url", "URL")} *</label>
                <input
                  id="link-url"
                  type="text"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className={formErrors.url ? "error" : ""}
                  placeholder="https://example.com"
                />
                {formErrors.url && (
                  <span className="error-text">{formErrors.url}</span>
                )}
              </div>
              <div className="modal-actions">
                <Button type="button" onClick={closeModal} variant="secondary">
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    createLinkMutation.isPending || updateLinkMutation.isPending
                  }
                >
                  {modalMode === "create"
                    ? t("links.create", "Create")
                    : t("links.update", "Update")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinksManagement;
