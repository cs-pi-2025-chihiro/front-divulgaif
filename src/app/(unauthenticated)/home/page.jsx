import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchInput } from "../../../components/input";
import Button from "../../../components/button";
import FiltrarBuscaModal from "../../../components/modal/filtrar-busca/filtrarBuscaModal";
import "./page.css";
import mockedValues from "../../../data/mockedValues.json";
import PaginatedResults from "../../../components/paginated-results/paginated-results";
import FiltrarApresentacaoModal from "../../../components/modal/filtrar-apresentacao/filtrarApresentacaoModal";

const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [works, setWorks] = useState(mockedValues.trabalhos);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    trabalho: {
      artigo: false,
      dissertacao: false,
      pesquisa: false,
      tcc: false,
    },
    palavrasChaves: "",
    periodo: {
      dataInicial: "",
      dataFinal: "",
    },
  });

  useEffect(() => {
    handleOAuthCallback();
  }, [location.hash]);

  const handleOAuthCallback = async () => {
    const hash = window.location.hash.substring(1);
    console.log("Full hash:", hash);
    const params = {};
    hash.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      if (key && value) {
        params[key] = decodeURIComponent(value);
      }
    });

    console.log("Parsed params:", params);
    console.log("access_token (underscore):", params.access_token);
    console.log("accessToken (camelCase):", params.accessToken);

    let accessToken = params.access_token || params.accessToken;

    const urlParams = new URLSearchParams(hash);
    console.log("URLSearchParams access_token:", urlParams.get("access_token"));
    console.log("URLSearchParams accessToken:", urlParams.get("accessToken"));
    console.log("All URLSearchParams:", [...urlParams.entries()]);

    if (!accessToken) {
      accessToken =
        urlParams.get("access_token") || urlParams.get("accessToken");
    }

    console.log("Final accessToken:", accessToken);

    if (!accessToken) {
      console.log("No access token found with either naming convention");
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const suapResponse = await fetch("https://suap.ifpr.edu.br/api/eu/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!suapResponse.ok) {
        throw new Error(`SUAP API error: ${suapResponse.status}`);
      }

      const suapUserData = await suapResponse.json();
      const processedUserData = {
        ra: suapUserData.identificacao,
        name: suapUserData.nome,
        email: suapUserData.email,
        secondaryEmail: suapUserData.email_secundario,
        campus: suapUserData.campus,
        userType: suapUserData.tipo_usuario,
        fullName: suapUserData.nome_registro,
        firstName: suapUserData.primeiro_nome,
        lastName: suapUserData.ultimo_nome,
        photo: suapUserData.foto,
        role: determineRole(suapUserData),
      };

      const authResponse = await fetch("/api/auth/suap-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: processedUserData,
          suapToken: accessToken,
          provider: "SUAP_IFPR",
        }),
      });

      if (!authResponse.ok) {
        throw new Error("Backend authentication failed");
      }

      const authResult = await authResponse.json();

      localStorage.setItem("divulgaifToken", authResult.token);
      localStorage.setItem("divulgaifUser", JSON.stringify(authResult.user));

      try {
        const response = await api.post(BASE_URL + "/api/v1/users", {
          name: processedUserData.name,
          email: processedUserData.email,
          secondaryEmail: processedUserData.secondaryEmail,
          ra: processedUserData.ra,
          avatarUrl: processedUserData.photo,
          userType: processedUserData.userType,
        });

        console.log("User created:", response.data);
      } catch (error) {
        console.error("Failed to create user:", error);
      }

      window.history.replaceState({}, document.title, window.location.pathname);

      navigate(`/${i18n.language}`);

      return true;
    } catch (err) {
      setError("Falha na autenticação com SUAP. Tente novamente.");
      window.history.replaceState({}, document.title, window.location.pathname);

      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const determineRole = (suapData) => {
    if (suapData.tipo_usuario.includes("aluno")) {
      return "STUDENT";
    }
    return suapData.tipo_usuario === "Aluno" ? "STUDENT" : "TEACHER";
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);

    let filteredWorks = [...mockedValues.trabalhos];

    if (Object.values(filters.trabalho).some((value) => value)) {
      filteredWorks = filteredWorks.filter((work) => {
        return filters.trabalho[work.type.toLowerCase()];
      });
    }

    if (filters.palavrasChaves.trim()) {
      const keywords = filters.palavrasChaves
        .split(";")
        .map((k) => k.trim().toLowerCase());
      filteredWorks = filteredWorks.filter((work) => {
        return keywords.some(
          (keyword) =>
            work.title.toLowerCase().includes(keyword) ||
            work.description.toLowerCase().includes(keyword)
        );
      });
    }

    if (filters.periodo.dataInicial || filters.periodo.dataFinal) {
      filteredWorks = filteredWorks.filter((work) => {
        const workDate = new Date(work.date);
        let isValid = true;

        if (filters.periodo.dataInicial) {
          const startDate = new Date(filters.periodo.dataInicial);
          isValid = isValid && workDate >= startDate;
        }

        if (filters.periodo.dataFinal) {
          const endDate = new Date(filters.periodo.dataFinal);
          isValid = isValid && workDate <= endDate;
        }

        return isValid;
      });
    }

    setWorks(filteredWorks);
  };

  return (
    <div className="ifexplore-container">
      <div className="ifexplore-search-container">
        <h1 className="ifexplore-title">{t("home.welcome")}</h1>
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <SearchInput
              className="search-input"
              placeholder={t("common.search") + "..."}
            />
          </div>
        </div>
        <div className="filter-buttons-container">
          <Button
            variant="tertiary"
            size="md"
            className="filter-btn"
            onClick={() => setIsFilterModalOpen(true)}
          >
            {t("common.filter")}
          </Button>
          <Button
            variant="tertiary"
            size="md"
            className="filter-btn"
            onClick={() => setIsPresentationModalOpen(true)}
          >
            {t("filters.title")}
          </Button>
        </div>
        <div className="new-work-container">
          <Button variant="tertiary" size="lg" className="new-work-btn">
            <span className="icon">+</span> {t("home.newWork")}
          </Button>
        </div>
      </div>

      <PaginatedResults works={works} />

      <FiltrarBuscaModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      <FiltrarApresentacaoModal
        isOpen={isPresentationModalOpen}
        onClose={() => setIsPresentationModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default Home;
