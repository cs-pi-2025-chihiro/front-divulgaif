import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DOMPurify from 'dompurify';
import api from "../../../services/utils/api";
import { ENDPOINTS } from "../../../enums/endpoints";
import { SUAP_CREDENTIALS } from "../../../constants";
import { createSuap } from "../../../services/users/createSuap";

const loginSuapUser = async (suapData, provider) => {
  const response = await api.post(ENDPOINTS.AUTH.OAUTH_LOGIN, {
    userData: {
      identificacao: suapData.identificacao,
      nome: suapData.nome_registro,
      email: suapData.email,
      tipoUsuario: suapData.tipo_usuario,
    },
    provider,
  });
  return response.data;
};

const useSuap = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const SUAP_PROVIDER = process.env.REACT_APP_SUAP_PROVIDER;

  const loginWithSuap = () => {
    const authUrl = new URL(ENDPOINTS.SUAP.OAUTH);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("client_id", SUAP_CREDENTIALS.clientId);
    authUrl.searchParams.append("redirect_uri", window.location.origin);
    authUrl.searchParams.append("scope", SUAP_CREDENTIALS.scope);

    window.location.href = authUrl.toString();
  };

  const handleOAuthCallback = async () => {
    // ✔️ Proteção contra chamadas duplicadas (Race Condition) usando ref síncrono
    if (isProcessingRef.current) return false;

    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const oauthHash = localStorage.getItem("oauth_hash");

      if (!oauthHash || !oauthHash.includes("=")) {
        throw new Error("Malformed OAuth hash");
      }

      const params = new URLSearchParams(oauthHash.substring(1));
      const accessToken = params.get("access_token");

      // ✔️ Validação do token
      if (!accessToken) {
        throw new Error("Invalid access token");
      }

      const suapResponse = await fetch(ENDPOINTS.SUAP.INFO, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!suapResponse.ok) {
        throw new Error(`SUAP API error: ${suapResponse.status}`);
      }

      const suapUserData = await suapResponse.json();

      let loginResult;

      try {
        loginResult = await loginSuapUser(suapUserData, SUAP_PROVIDER);
      } catch (error) {
        // tenta criar usuário
        await createSuap(suapUserData);

        // tenta login novamente
        loginResult = await loginSuapUser(suapUserData, SUAP_PROVIDER);
      }

      // ✔️ Validação de retorno da API
      if (!loginResult || !loginResult.accessToken) {
        throw new Error("Invalid login response");
      }

      // ✔️ Salvando com segurança
      try {
        if (loginResult.accessToken) {
          localStorage.setItem("accessToken", loginResult.accessToken);
        }

        if (loginResult.refreshToken) {
          localStorage.setItem("refreshToken", loginResult.refreshToken);
        }

        if (loginResult.user) {
          // Sanitizar dados para prevenir XSS
          const sanitizedUser = {
            ...loginResult.user,
            nome_registro: DOMPurify.sanitize(loginResult.user.nome_registro || '', { ALLOWED_TAGS: [] }),
            email: DOMPurify.sanitize(loginResult.user.email || '', { ALLOWED_TAGS: [] }),
            // Adicionar outros campos se necessário
          };

          localStorage.setItem(
            "userData",
            JSON.stringify(sanitizedUser)
          );

          if (
            loginResult.user.roles &&
            Array.isArray(loginResult.user.roles)
          ) {
            const roleNames = loginResult.user.roles.map(
              (role) => role.name
            );
            localStorage.setItem(
              "userRoles",
              JSON.stringify(roleNames)
            );
          }
        }
      } catch (storageError) {
        throw new Error("Storage failure");
      }

      // limpeza
      localStorage.removeItem("oauth_hash");
      window.history.replaceState({}, document.title, window.location.pathname);

      navigate(`/${i18n.language}`);

      return true;
    } catch (err) {
      console.error("OAuth callback error:", err);
      setError("Falha na autenticação com SUAP. Tente novamente.");

      localStorage.removeItem("oauth_hash");
      window.history.replaceState({}, document.title, window.location.pathname);

      return false;
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
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