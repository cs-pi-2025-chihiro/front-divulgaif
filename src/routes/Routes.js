import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../app/(unauthenticated)/home/page";
import LoginPage from "../app/(unauthenticated)/login/page";
import RegisterPage from "../app/(unauthenticated)/register/page";
import WorkDetail from "../app/(unauthenticated)/home/[id]/page";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageRoute from "./LanguageRoute";

function AppRoutes() {
  const DefaultLanguageRedirect = () => {
    const { i18n } = useTranslation();
    const userLang = navigator.language.split("-")[0];
    const targetLang = ["en", "pt"].includes(userLang) ? userLang : "pt";

    useEffect(() => {
      // You could set the language here if needed
      // i18n.changeLanguage(targetLang);
    }, []);

    return <Navigate to={`/${targetLang}`} replace />;
  };

  return (
    <Routes>
      {/* Default route redirects to language-specific route */}
      <Route path="/" element={<DefaultLanguageRedirect />} />

      {/* English Routes */}
      <Route path="/en" element={<LanguageRoute lang="en" />}>
        <Route index element={<Home />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        {/* Note the path format here - should match our navigation */}
        <Route path="work/:id" element={<WorkDetail />} />
      </Route>

      {/* Portuguese Routes */}
      <Route path="/pt" element={<LanguageRoute lang="pt" />}>
        <Route index element={<Home />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        {/* Note the path format here - should match our navigation */}
        <Route path="trabalho/:id" element={<WorkDetail />} />
      </Route>

      {/* Catch all unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;