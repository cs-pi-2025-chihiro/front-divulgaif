import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import i18n from "../../../i18n";
import { SearchInput } from "../../../components/input";
import Button from "../../../components/button";
import { Globe, Code2, Users, GraduationCap, Building2 } from "lucide-react";
import FiltrarBuscaModal from "../../../components/modal/filtrar-busca/filtrarBuscaModal";
import "./page.css";
import PaginatedResults from "../../../components/paginated-results/paginated-results";
import useSuap from "../login/useSuap";
import { pageAtom, searchAtom, sizeAtom, useHome } from "./useHome";
import { useAtom } from "jotai";
import { mapPaginationValues } from "../../../services/utils/utils";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useAtom(pageAtom);
  const [currentSize, setCurrentSize] = useAtom(sizeAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const { handleOAuthCallback } = useSuap();
  const { works, totalWorks, totalPages, isLoading, refetch } =
    useHome(appliedFilters);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay for child elements
          setTimeout(() => {
            entry.target.classList.add("animate-in");
          }, index * 50);
        }
      });
    }, observerOptions);

    // Wait a bit for DOM to fully render
    setTimeout(() => {
      const animatedElements = document.querySelectorAll("[data-animate]");
      animatedElements.forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [works, isLoading]);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    if (newSearch !== search) {
      setCurrentPage(0);
    }
  };

  const handleApplyFilters = (filters) => {
    const backendFilters = {};

    if (
      filters.workType &&
      Object.values(filters.workType).some((value) => value)
    ) {
      const selectedTypes = Object.entries(filters.workType)
        .filter(([key, value]) => value)
        .map(([key]) => key.toUpperCase());
      if (selectedTypes.length > 0) {
        backendFilters.workTypes = selectedTypes.join(",");
      }
    }

    if (filters.labels) {
      backendFilters.labels = filters.labels;
    }

    if (filters.period) {
      if (filters.period.startDate) {
        backendFilters.startDate = filters.period.startDate;
      }
      if (filters.period.endDate) {
        backendFilters.endDate = filters.period.endDate;
      }
    }

    if (filters.pagination) {
      mapPaginationValues(filters.pagination, setCurrentSize);
    }

    if (filters.order) {
      backendFilters.order = filters.order;
    }

    setCurrentPage(0);
    setAppliedFilters(backendFilters);
  };

  const handleNewWorkClick = () => {
    const currentLang = i18n.language;
    const workPath = currentLang === "pt" ? "trabalho" : "work";
    const newLang = currentLang === "pt" ? "novo" : "new";

    navigate(`/${currentLang}/${workPath}/${newLang}`);
  };

  if (error) {
    return (
      <div className="ifexplore-container">
        <div className="error-container">
          <p>{error}</p>
          <div>{t("common.retry") || "Try Again"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ifexplore-container">
      <div className="ifexplore-search-container">
        <h1 className="ifexplore-title">{t("home.welcome")}</h1>
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <SearchInput
              className="search-input"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("common.search") + "..."}
            />
          </div>
        </div>
        <div className="filter-buttons-container">
          <Button
            variant="tertiary"
            size="lg"
            className="filter-btn"
            onClick={() => setIsFilterModalOpen(true)}
          >
            {t("common.filter")}
          </Button>
          <Button
            variant="tertiary"
            size="lg"
            className="filter-btn"
            onClick={handleNewWorkClick}
          >
            <span className="icon">+</span> {t("home.newWork")}
          </Button>
        </div>
      </div>

      <PaginatedResults
        content={works}
        totalPages={totalPages}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalElements={totalWorks}
        refetch={refetch}
      />

      <section className="community-section" data-animate>
        <div className="community-container">
          <h2 className="section-title">
            {t(
              "home.community.title",
              "Uma Plataforma Feita pela Comunidade, para a Comunidade"
            )}
          </h2>
          <p className="community-intro">
            {t(
              "home.community.intro",
              "O DivulgaIF é um projeto de código aberto desenvolvido por estudantes e professores do IFPR. Nossa missão é criar um espaço onde todos possam descobrir e compartilhar conhecimento de forma aberta e acessível."
            )}
          </p>
          <div className="community-grid">
            <div className="community-card" data-animate>
              <div className="community-icon">
                <Globe size={64} strokeWidth={1.5} />
              </div>
              <h3>{t("home.community.openAccess.title", "Acesso Aberto")}</h3>
              <p>
                {t(
                  "home.community.openAccess.description",
                  "Todos os trabalhos publicados estão disponíveis gratuitamente para consulta, promovendo o livre acesso ao conhecimento científico e acadêmico."
                )}
              </p>
            </div>
            <div className="community-card" data-animate>
              <div className="community-icon">
                <Code2 size={64} strokeWidth={1.5} />
              </div>
              <h3>{t("home.community.openSource.title", "Código Aberto")}</h3>
              <p>
                {t(
                  "home.community.openSource.description",
                  "Nossa plataforma é open source, permitindo que a comunidade contribua com melhorias e adaptações para atender melhor às necessidades acadêmicas."
                )}
              </p>
            </div>
            <div className="community-card" data-animate>
              <div className="community-icon">
                <Users size={64} strokeWidth={1.5} />
              </div>
              <h3>{t("home.community.collaborative.title", "Colaborativo")}</h3>
              <p>
                {t(
                  "home.community.collaborative.description",
                  "Construído pela comunidade acadêmica do IFPR, o DivulgaIF é resultado do trabalho conjunto de estudantes, professores e pesquisadores."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" data-animate>
        <div className="faq-container">
          <h2 className="section-title">
            {t("home.faq.title", "Perguntas Frequentes")}
          </h2>
          <div className="faq-grid">
            <div className="faq-item" data-animate>
              <h3>{t("home.faq.question1", "Quem pode usar o DivulgaIF?")}</h3>
              <p>
                {t(
                  "home.faq.answer1",
                  "Estudantes, professores e pesquisadores do IFPR podem usar a plataforma."
                )}
              </p>
            </div>
            <div className="faq-item" data-animate>
              <h3>
                {t("home.faq.question2", "É necessário pagar para publicar?")}
              </h3>
              <p>
                {t(
                  "home.faq.answer2",
                  "Não! O DivulgaIF é totalmente gratuito para toda a comunidade acadêmica."
                )}
              </p>
            </div>
            <div className="faq-item" data-animate>
              <h3>
                {t(
                  "home.faq.question3",
                  "Como faço para publicar meu trabalho?"
                )}
              </h3>
              <p>
                {t(
                  "home.faq.answer3",
                  "Basta fazer login, clicar em 'Novo Trabalho' e preencher as informações solicitadas."
                )}
              </p>
            </div>
            <div className="faq-item" data-animate>
              <h3>
                {t(
                  "home.faq.question4",
                  "Posso editar meu trabalho depois de publicado?"
                )}
              </h3>
              <p>
                {t(
                  "home.faq.answer4",
                  "Sim, você pode editar ou remover seus trabalhos a qualquer momento."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ifpr-project-section" data-animate>
        <div className="ifpr-project-container">
          <div className="ifpr-project-content">
            <h2>{t("home.ifpr.title", "Um Projeto do IFPR")}</h2>
            <p>
              {t(
                "home.ifpr.description",
                "O DivulgaIF nasceu no Instituto Federal do Paraná como uma iniciativa estudantil para revolucionar a forma como compartilhamos e descobrimos conhecimento acadêmico. Desenvolvido por alunos e orientado por professores, este projeto representa o compromisso do IFPR com a inovação e o acesso aberto à educação."
              )}
            </p>
            <div className="ifpr-features">
              <div className="ifpr-feature-item" data-animate>
                <div className="ifpr-feature-icon"></div>
                <div className="ifpr-feature-text">
                  <h4>{t("home.ifpr.feature1.title", "Projeto Acadêmico")}</h4>
                  <p>
                    {t(
                      "home.ifpr.feature1.description",
                      "Desenvolvido como projeto de extensão e pesquisa pelos alunos do IFPR."
                    )}
                  </p>
                </div>
              </div>
              <div className="ifpr-feature-item" data-animate>
                <div className="ifpr-feature-icon"></div>
                <div className="ifpr-feature-text">
                  <h4>{t("home.ifpr.feature2.title", "Open Source")}</h4>
                  <p>
                    {t(
                      "home.ifpr.feature2.description",
                      "Código totalmente aberto e disponível para a comunidade contribuir."
                    )}
                  </p>
                </div>
              </div>
              <div className="ifpr-feature-item" data-animate>
                <div className="ifpr-feature-icon"></div>
                <div className="ifpr-feature-text">
                  <h4>
                    {t("home.ifpr.feature3.title", "Em Constante Evolução")}
                  </h4>
                  <p>
                    {t(
                      "home.ifpr.feature3.description",
                      "Sempre melhorando com feedback da comunidade acadêmica."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="ifpr-badge" data-animate>
            <div className="ifpr-logo">
              <Building2 size={80} strokeWidth={1.5} />
            </div>
            <h3>{t("home.ifpr.badge.title", "Instituto Federal do Paraná")}</h3>
            <p>
              {t(
                "home.ifpr.badge.description",
                "Educação, Ciência e Tecnologia para transformar o futuro através do conhecimento compartilhado."
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section" data-animate>
        <div className="cta-container">
          <h2>{t("home.cta.title", "Pronto para começar?")}</h2>
          <p>
            {t(
              "home.cta.description",
              "Junte-se à comunidade DivulgaIF e compartilhe seu conhecimento."
            )}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="cta-button"
            onClick={handleNewWorkClick}
          >
            {t("home.cta.button", "Publicar Trabalho")}
          </Button>
        </div>
      </section>

      <FiltrarBuscaModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        setSize={setCurrentSize}
      />
    </div>
  );
};

export default Home;
