import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../services/utils/api";
import { BASE_URL } from "../../../constants";

const useSuap = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const SUAP_CONFIG = {
    clientId: "1aJjdqqzsur8URjIDDnRyz5TMoVrOfA0MQQhYdCu",
    redirectUri: `${window.location.origin}/pt/login`,
    scope: "identificacao email",
  };

  const loginWithSuap = () => {
    const authUrl = new URL("https://suap.ifpr.edu.br/o/authorize/");
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("client_id", SUAP_CONFIG.clientId);
    authUrl.searchParams.append("redirect_uri", SUAP_CONFIG.redirectUri);
    authUrl.searchParams.append("scope", SUAP_CONFIG.scope);

    window.location.href = authUrl.toString();
    handleOAuthCallback();
  };

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

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("Current location.hash:", location.hash);
    console.log(
      "Hash includes access_token:",
      location.hash.includes("access_token=")
    );

    if (location.hash.includes("access_token=")) {
      console.log("Calling handleOAuthCallback");
      handleOAuthCallback();
    } else {
      console.log("Not calling handleOAuthCallback - no access_token in hash");
    }
  }, [location.hash]);

  return {
    loginWithSuap,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};

export default useSuap;
