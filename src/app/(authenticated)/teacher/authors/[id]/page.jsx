import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./page.css";
import { Input, SearchInput } from "../../../components/input";
import Button from "../../../components/button";
import Modal from "../../../components/modal/modal";
import { useNotification } from "../../../components/notification/NotificationProvider";
import { useAuthors } from "./useAuthors";

const AuthorsPage = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();
  const {
    authors,
    isLoading,
    totalPages,
    currentPage,
    setCurrentPage,
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
  }, [currentPage, searchTerm]);

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
    <div className="authors-page">
      <div className="authors-header">
        <h1>{t("authors.title")}</h1>
        <div className="search-section">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t("authors.searchPlaceholder")}
            className="search-input"
          />
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
          <>
            <div className="authors-grid">
              {authors.map((author) => (
                <div key={author.id} className="author-card">
                  <div className="author-avatar">
                    <span>{author.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="author-info">
                    <h3>{author.name}</h3>
                    <p className="author-email">{author.email}</p>
                    <span className={`author-type ${author.type?.toLowerCase()}`}>
                      {author.type === "CADASTRADO"
                        ? t("authors.registered")
                        : t("authors.notRegistered")}
                    </span>
                  </div>
                  <div className="author-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(author)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(author)}
                    >
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination-section">
              <div className="pagination-info">
                {t("pagination.showing")} {currentPage * 8 + 1} -{" "}
                {Math.min((currentPage + 1) * 8, totalElements)} {t("pagination.of")}{" "}
                {totalElements} {t("authors.authors")}
              </div>
              <div className="pagination-controls">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                >
                  &lt;
                </Button>
                <span className="page-indicator">
                  {t("pagination.page")} {currentPage + 1} {t("pagination.of")} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1}
                >
                  &gt;
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

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

export default AuthorsPage;