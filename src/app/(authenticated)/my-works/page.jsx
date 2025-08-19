import React, { useState, useEffect } from "react";
import {
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  Globe,
} from "lucide-react";
import ptTranslations from "../../../locales/pt/translation.json";
import enTranslations from "../../../locales/en/translation.json";
import "./page.css";
import {
  getFiltroTexto,
  getStatusColor,
  getWorkStatus,
  getWorkTypes,
  navigateTo,
} from "../../../services/utils/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button";
import FiltrarBuscaModal from "../../../components/modal/filtrar-busca/filtrarBuscaModal";

const MyWorks = () => {
  const [filtroTrabalhos, setFiltroTrabalhos] = useState("");
  const [showTrabalhosFilter, setShowTrabalhosFilter] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [language, setLanguage] = useState("pt");
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const trabalhosPorPagina = 6;

  const usuarioLogado = {
    id: 1,
    nome: "Pedro",
    email: "pedro@estudante.ifpr.edu.br",
  };

  const todosTrabalhos = [
    {
      id: 1,
      titulo: "Desenvolvimento de Sistema Web para Gestão Acadêmica",
      descricao:
        "Projeto focado no desenvolvimento de uma aplicação web moderna utilizando React e Node.js para gestão de dados acadêmicos, com foco em usabilidade e performance.",
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Maria Santos", email: "maria@estudante.ifpr.edu.br" },
      ],
      data: "14 Jan, 2024",
      categoria: "Artigo",
      status: "draft",
      tags: ["Desenvolvimento de Software", "React", "Node.js"],
      imagem: "/api/placeholder/300/200",
    },
  ];

  const trabalhos = todosTrabalhos.filter((trabalho) =>
    trabalho.autores.some((autor) => autor.email === usuarioLogado.email)
  );

  const statusOptions = ["DRAFT", "SUBMITTED", "REJECTED", "PENDING_CHANGES"];
  const categoriaOptions = [
    "ARTICLE",
    "FINAL_THESIS",
    "EXTENSION",
    "DISSERTATION",
  ];

  const todasOpcoesFiltro = [
    {
      tipo: "categoria",
      label: t("filters.workType"),
      opcoes: categoriaOptions,
    },
    { tipo: "status", label: t("filters.workStatus"), opcoes: statusOptions },
  ];

  const trabalhosFiltrados = trabalhos.filter((trabalho) => {
    if (!filtroTrabalhos) return true;

    if (statusOptions.includes(filtroTrabalhos)) {
      return trabalho.status === filtroTrabalhos;
    }

    if (categoriaOptions.includes(filtroTrabalhos)) {
      return trabalho.categoria === filtroTrabalhos;
    }

    return (
      trabalho.titulo.toLowerCase().includes(filtroTrabalhos.toLowerCase()) ||
      trabalho.tags.some((tag) =>
        tag.toLowerCase().includes(filtroTrabalhos.toLowerCase())
      )
    );
  });

  const totalPaginas = Math.ceil(
    trabalhosFiltrados.length / trabalhosPorPagina
  );
  const indiceInicio = (paginaAtual - 1) * trabalhosPorPagina;
  const indiceFim = indiceInicio + trabalhosPorPagina;
  const trabalhosPaginaAtual = trabalhosFiltrados.slice(
    indiceInicio,
    indiceFim
  );

  const handleApplyFilters = (filtros) => {
    setFiltroTrabalhos(filtros.texto);
    setShowTrabalhosFilter(false);
    setPaginaAtual(1);
  };

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroTrabalhos]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".filter-dropdown")) {
        setShowTrabalhosFilter(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleNovoTrabalho = () => {
    const newWorkPath = currentLang === "pt" ? "trabalho/novo" : "work/new";
    navigateTo(newWorkPath, navigate, currentLang);
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
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
          <h1 className="results-title">{t("Meus Trabalhos")}</h1>
        </div>

        <div className="filters-section">
          <div className="filter-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTrabalhosFilter(!showTrabalhosFilter);
              }}
              className="filter-button"
            >
              <Filter className="icon" />
              <span>{t("filters.filterSearch")}</span>
            </button>
          </div>

          <button onClick={handleNovoTrabalho} className="new-work-button">
            <Plus className="icon" />
            {t("Novo Trabalho")}
          </button>
        </div>

        {/* Results and Pagination */}
        <div className="results-pagination">
          <h2 className="results-title">
            {trabalhosFiltrados.length}{" "}
            {trabalhosFiltrados.length === 1
              ? t("pagination.result")
              : t("pagination.results")}
          </h2>

          {totalPaginas > 1 && (
            <div className="pagination-controls">
              <span className="pagination-info">
                {t("page")} {paginaAtual} {t("of")} {totalPaginas}
              </span>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button
                  onClick={handlePaginaAnterior}
                  disabled={paginaAtual === 1}
                  className={`pagination-button ${
                    paginaAtual === 1 ? "disabled" : "enabled"
                  }`}
                >
                  <ChevronLeft className="icon" />
                </button>
                <button
                  onClick={handleProximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className={`pagination-button ${
                    paginaAtual === totalPaginas ? "disabled" : "enabled"
                  }`}
                >
                  <ChevronRight className="icon" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Works Grid */}
        {trabalhosPaginaAtual.length > 0 ? (
          <div className="trabalhos-grid">
            {trabalhosPaginaAtual.map((trabalho) => (
              <div key={trabalho.id} className="trabalho-card">
                <div className="card-content">
                  <div className="image-placeholder">
                    <span className="image-text">{t("imageText")}</span>
                  </div>

                  <div className="status-container">
                    <span
                      className={`status-badge ${getStatusColor(
                        trabalho.status
                      )}`}
                    >
                      {getWorkStatus(
                        trabalho.status.toUpperCase(),
                        currentLang
                      )}
                    </span>
                  </div>

                  <h3 className="trabalho-title">{trabalho.titulo}</h3>

                  <p className="trabalho-description">{trabalho.descricao}</p>

                  <div className="trabalho-meta">
                    <div>
                      <strong>{t("authors")}:</strong>{" "}
                      {trabalho.autores.map((a) => a.nome).join(", ")}
                    </div>
                    <div>
                      <strong>{t("date")}:</strong> {trabalho.data}
                    </div>
                  </div>

                  <div className="tags-container">
                    <span className="categoria-tag">
                      {t(`workTypes.${trabalho.categoria}`)}
                    </span>
                    {trabalho.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                    {trabalho.tags.length > 2 && (
                      <span className="tag">+{trabalho.tags.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="image-placeholder empty-icon">
              {" "}
              {/* Reusing image-placeholder for styling the icon background */}
              <Search className="search-icon" />
            </div>
            <h3 className="empty-title">{t("noWorksFound")}</h3>
            <p className="empty-description">
              {filtroTrabalhos ? t("noWorksFoundDesc") : t("noWorksYet")}
            </p>
            <button
              onClick={handleNovoTrabalho}
              className="empty-action-button"
            >
              <Plus className="icon" />
              {filtroTrabalhos ? t("createNewWork") : t("createFirstWork")}
            </button>
          </div>
        )}
      </div>

      <FiltrarBuscaModal
        isOpen={showTrabalhosFilter}
        onClose={() => setShowTrabalhosFilter(false)}
        onApplyFilters={handleApplyFilters}
        showStatus={true}
      />
    </div>
  );
};

export default MyWorks;
