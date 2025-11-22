import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./page.css";
import { Input, SearchInput } from "../../../../../components/input";
import Button from "../../../../../components/button";
import Modal from "../../../../../components/modal/modal";
import { useNotification } from "../../../../../components/notification/NotificationProvider";
import { useAuthors, AUTHORS_PAGE_SIZE_OPTIONS } from "./useAuthors";

const AuthorsManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();
  const {
    authors,
    isLoading,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalElements,
    searchTerm,
    setSearchTerm,
    fetchAuthors,
    updateAuthor,
    deleteAuthor,
  } = useAuthors();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    fetchAuthors();
  }, [currentPage, pageSize, searchTerm]);

  const handleEditClick = (author) => {
    setSelectedAuthor(author);
    setEditForm({
      name: author.name,
      email: author.email,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (author) => {
    setSelectedAuthor(author);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAuthor(selectedAuthor.id, editForm);
      showSuccess(t("authors.updateSuccess"));
      setIsEditModalOpen(false);
      fetchAuthors();
    } catch (error) {
      showError(error.message || t("authors.updateError"));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAuthor(selectedAuthor.id);
      showSuccess(t("authors.deleteSuccess"));
      setIsDeleteModalOpen(false);
      fetchAuthors();
    } catch (error) {
      showError(error.message || t("authors.deleteError"));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="authors-dashboard-section">
      <div className="authors-header">
        <div className="search-filter-container">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t("authors.searchPlaceholder")}
            className="authors-search-input"
          />
          <div className="page-size-selector">
            <label htmlFor="page-size" className="page-size-label">
              {t("pagination.itemsPerPage", "Items per page:")}
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="page-size-select"
            >
              {AUTHORS_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <button className="filter-authors-button">
            <span className="filter-icon">⚙</span>
            {t("authors.filterButton", "Filtrar Autores")}
          </button>
        </div>
        <div className="pagination-controls-top">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className="pagination-arrow"
          >
            &lt;
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages - 1}
            className="pagination-arrow"
          >
            &gt;
          </Button>
        </div>
      </div>

      <div className="authors-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{t("common.loading")}</p>
          </div>
        ) : authors.length === 0 ? (
          <div className="no-results">
            <p>{t("authors.noAuthorsFound")}</p>
          </div>
        ) : (
          <div className="authors-grid">
            {authors.map((author) => (
              <div key={author.id} className="author-card-dashboard">
                <div className="author-avatar-dashboard">
                  <span>{author.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="author-info-dashboard">
                  <h3 className="author-name-dashboard">{author.name}</h3>
                  <p className="author-email-dashboard">{author.email}</p>
                  <span
                    className={`author-badge ${
                      (author.userId || author.type === "CADASTRADO") ? "cadastrado" : "sem"
                    }`}
                  >
                    {(author.userId || author.type === "CADASTRADO")
                      ? t("authors.registered")
                      : t("authors.notRegistered")}
                  </span>
                </div>
                <div className="author-actions-dashboard">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditClick(author)}
                    className="edit-button"
                  >
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(author)}
                    className="delete-button"
                  >
                    {t("common.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-footer">
          <span className="pagination-info">
            {t("pagination.showing")} {currentPage * pageSize + 1} -{" "}
            {Math.min((currentPage + 1) * pageSize, totalElements)}{" "}
            {t("pagination.of")} {totalElements} {t("authors.authors")}
          </span>
          <div className="pagination-controls">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              {t("pagination.previousPage", "Previous")}
            </Button>
            <span className="page-indicator">
              {t("pagination.page")} {currentPage + 1} {t("pagination.of")}{" "}
              {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
              }
              disabled={currentPage >= totalPages - 1}
            >
              {t("pagination.nextPage", "Next")}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("authors.editAuthor")}
        width="medium"
      >
        <form onSubmit={handleEditSubmit} className="edit-author-form">
          <div className="form-group">
            <label htmlFor="edit-name">{t("authors.name")}</label>
            <Input
              id="edit-name"
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-email">{t("authors.email")}</label>
            <Input
              id="edit-email"
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              required
              className="form-input"
            />
          </div>
          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary">
              {t("common.save")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("authors.deleteAuthor")}
        width="small"
      >
        <div className="delete-confirmation">
          <p>
            {t("authors.deleteConfirmation", {
              name: selectedAuthor?.name,
            })}
          </p>
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AuthorsManagement;
