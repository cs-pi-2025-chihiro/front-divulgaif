import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../services/utils/api";
import { ENDPOINTS, endpoints } from "../../../enums/endpoints";
import { SUAP_CREDENTIALS } from "../../../constants";

const createSuapUser = async (suapUserData) => {
  await api.post(
    ENDPOINTS.USERS.CREATE,
    {
      name: suapUserData.nome_registro,
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
};

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
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const SUAP_PROVIDER = process.env.DIVULGAIF_REACT_APP_SUAP_PROVIDER;

  const loginWithSuap = () => {
    const authUrl = new URL(ENDPOINTS.SUAP.OAUTH);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("client_id", SUAP_CREDENTIALS.clientId);
    authUrl.searchParams.append("redirect_uri", window.location.origin);
    authUrl.searchParams.append("scope", SUAP_CREDENTIALS.scope);

    window.location.href = authUrl.toString();
  };

  const handleOAuthCallback = async () => {
    try {
      const oauthHash = localStorage.getItem("oauth_hash");

      if (!oauthHash) {
        return false;
      }

      const params = new URLSearchParams(oauthHash.substring(1));
      const accessToken = params.get("access_token");

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

      try {
        const loginResult = await loginSuapUser(suapUserData, SUAP_PROVIDER);

        if (loginResult) {
          localStorage.setItem("accessToken", loginResult.accessToken);
          localStorage.setItem("refreshToken", loginResult.refreshToken);

          if (loginResult.user) {
            localStorage.setItem("userData", JSON.stringify(loginResult.user));

            if (
              loginResult.user.roles &&
              Array.isArray(loginResult.user.roles)
            ) {
              const roleNames = loginResult.user.roles.map((role) => role.name);
              localStorage.setItem("userRoles", JSON.stringify(roleNames));
            }
          }

          localStorage.removeItem("oauth_hash");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          navigate(`/${i18n.language}`);
          return true;
        }
      } catch (error) {
        console.error("error: ", error);
      }

      try {
        await createSuapUser(suapUserData);
      } catch (error) {
        console.error("error:", error);
      }

      const loginResult = await loginSuapUser(suapUserData, SUAP_PROVIDER);

      if (!loginResult) {
        throw new Error("Failed to login after user creation");
      }

      localStorage.setItem("accessToken", loginResult.accessToken);
      localStorage.setItem("refreshToken", loginResult.refreshToken);

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
