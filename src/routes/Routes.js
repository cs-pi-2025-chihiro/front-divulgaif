import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../app/(unauthenticated)/home/page";
import LoginPage from "../app/(unauthenticated)/login/page";
import RegisterPage from "../app/(unauthenticated)/register/page";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageRoute from "./LanguageRoute";

function AppRoutes() {
  const DefaultLanguageRedirect = () => {
    const { i18n } = useTranslation();
    const userLang = navigator.language.split("-")[0];
    const targetLang = ["en", "pt"].includes(userLang) ? userLang : "pt";

    useEffect(() => {}, []);

    return <Navigate to={`/${targetLang}`} replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<DefaultLanguageRedirect />} />

      <Route path="/en" element={<LanguageRoute lang="en" />}>
        <Route index element={<Home />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route path="/pt" element={<LanguageRoute lang="pt" />}>
        <Route index element={<Home />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
