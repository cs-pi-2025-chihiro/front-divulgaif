import React, { useState, useEffect } from "react";
import { Filter, Plus, ExternalLink, Edit2, Trash2 } from "lucide-react";
import "./page.css";
import { navigateTo, mapPaginationValues } from "../../services/utils/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { pageAtom, searchAtom, sizeAtom, useLinks } from "./useLinks";
import { useAtom } from "jotai";
import { SearchInput } from "../input";
import Button from "../button";
import { deleteLink } from "../../services/links/list";

const LinksManagement = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [currentSize, setCurrentSize] = useAtom(sizeAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const [editingLink, setEditingLink] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: "", url: "" });
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const { links, totalPages, totalLinks, isLoading, refetch } =
    useLinks(appliedFilters);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".filter-dropdown")) {
        setIsFilterModalOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    if (newSearch !== search) {
      setCurrentPage(0);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (window.confirm(t("Delete") || "Are you sure?")) {
      try {
        await deleteLink(linkId);
        refetch();
      } catch (error) {
        console.error("Error deleting link:", error);
        alert(t("Deleting") || "Error deleting link");
      }
    }
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
    setEditFormData({ title: link.title, url: link.url });
    setShowEditModal(true);
  };

  const handleCreateNewLink = () => {
    const newLinkPath = currentLang === "pt" ? "novo-link" : "new-link";
    navigateTo(`links/${newLinkPath}`, navigate, currentLang);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === "pt" ? "pt-BR" : "en-US");
  };

  return (
    <div className="container">
      <div className="main-content">
        <div
          className="filters-section"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h1 className="results-title">{t("header.links") || "Links"}</h1>
          <Button
            onClick={handleCreateNewLink}
            className="create-link-button"
            size="2lg"
          >
            <Plus className="icon" />
            <span>{t("Adicionar") || "Criar"}</span>
          </Button>
        </div>

        <div className="search-input-wrapper">
          <SearchInput
            className="search-input"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("common.search") + "..."}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <p>{t("common.loading") || "Loading..."}</p>
        </div>
      ) : links.length === 0 ? (
        <div className="empty-state">
          <ExternalLink className="empty-state-icon" />
          <h2 className="empty-state-title">
            {t("Nenhum link encontrado") || "No links found"}
          </h2>
          <p className="empty-state-text">
            {t("Nenhuma descrição encontrada") ||
              "Create a new link to get started"}
          </p>
        </div>
      ) : (
        <div className="links-grid">
          {links.map((link) => (
            <div key={link.id} className="link-card">
              <div className="link-card-header">
                <ExternalLink className="link-icon" />
              </div>
              <div className="link-content">
                <h3 className="link-title">{link.title}</h3>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-url"
                >
                  {link.url}
                </a>
                <p className="link-date">
                  {t("Criado em ") || "Created at"}:{" "}
                  {formatDate(link.createdAt)}
                </p>
              </div>
              <div className="link-actions">
                <button
                  className="action-button edit-button"
                  onClick={() => handleEditLink(link)}
                  title={t("common.edit") || "Edit"}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => handleDeleteLink(link.id)}
                  title={t("Deletar") || "Delete"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            {t("common.previous") || "Previous"}
          </button>
          <span className="pagination-info">
            {t("common.page") || "Page"} {currentPage + 1}{" "}
            {t("common.of") || "of"} {totalPages}
          </span>
          <button
            className="pagination-button"
            onClick={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            {t("common.next") || "Next"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LinksManagement;
