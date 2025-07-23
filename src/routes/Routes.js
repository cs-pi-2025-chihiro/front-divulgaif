import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../app/(unauthenticated)/home/page";
import LoginPage from "../app/(unauthenticated)/login/page";
import RegisterPage from "../app/(unauthenticated)/register/page";
import WorkDetail from "../app/(unauthenticated)/home/[id]/page";
import { useTranslation } from "react-i18next";
import LanguageRoute from "./LanguageRoute";
import GuestRoute from "./GuestRoute";
import MyWorks from "../app/(authenticated)/my-works/my-works";
import NewWork from "../app/(unauthenticated)/new-work/page";

function AppRoutes() {
  const DefaultLanguageRedirect = () => {
    const { i18n } = useTranslation();
    const userLang = navigator.language.split("-")[0];
    const targetLang = ["en", "pt"].includes(userLang) ? userLang : "pt";

    return <Navigate to={`/${targetLang}`} replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<DefaultLanguageRedirect />} />

      <Route path="/en" element={<LanguageRoute lang="en" />}>
        <Route index element={<Home />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route path="work/:id" element={<WorkDetail />} />
        <Route path="work/new" element={<NewWork />} />
      </Route>

      <Route path="/pt" element={<LanguageRoute lang="pt" />}>
        <Route index element={<Home />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route path="trabalho/:id" element={<WorkDetail />} />
        <Route path="trabalho/novo" element={<NewWork />} />
        <Route path="meus-trabalhos" element={<MyWorks />} />
      </Route>
      

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
