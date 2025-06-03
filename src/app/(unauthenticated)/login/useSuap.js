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
    handleOAuthCallback();
  };

  return {
    loginWithSuap,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};

export default useSuap;
