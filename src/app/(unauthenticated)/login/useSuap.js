import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../services/utils/api";
import { BASE_URL } from "../../../constants";
import axios from "axios";

const useSuap = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const SUAP_CONFIG = {
    clientId: "1aJjdqqzsur8URjIDDnRyz5TMoVrOfA0MQQhYdCu",
    redirectUri: `${window.location.origin}`,
    scope: "identificacao email",
  };

  const loginWithSuap = () => {
    const authUrl = new URL("https://suap.ifpr.edu.br/o/authorize/");
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("client_id", SUAP_CONFIG.clientId);
    authUrl.searchParams.append("redirect_uri", SUAP_CONFIG.redirectUri);
    authUrl.searchParams.append("scope", SUAP_CONFIG.scope);

    window.location.href = authUrl.toString();
  };

  const handleOAuthCallback = async () => {
    const oauthHash = localStorage.getItem("oauth_hash");

    if (!oauthHash) {
      console.log("No access token found");
      return false;
    }

    const params = new URLSearchParams(oauthHash.substring(1));
    const accessToken = params.get("access_token");

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

      await api.post(
        "/api/v1/users",
        {
          name: suapUserData.nome,
          email: suapUserData.email,
          secondaryEmail: suapUserData.email_secundario,
          ra: suapUserData.identificacao,
          avatarUrl: suapUserData.foto,
          userType: suapUserData.tipo_usuario,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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

  return {
    loginWithSuap,
    handleOAuthCallback,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};

export default useSuap;
