import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../app/(unauthenticated)/home/page";
import LoginPage from "../app/(unauthenticated)/login/page";
import RegisterPage from "../app/(unauthenticated)/register/page";
import WorkDetail from "../app/(unauthenticated)/home/[id]/page";
import NotFound from "../app/(unauthenticated)/404/page";
import { useTranslation } from "react-i18next";
import LanguageRoute from "./LanguageRoute";
import GuestRoute from "./GuestRoute";
import StudentRoute from "./StudentRoute";
import AuthenticatedRoute from "./AuthenticatedRoute";
import NewWork from "../app/(authenticated)/new-work/page";
import EditWork from "../app/(authenticated)/edit-work/[id]/page";
import TeacherRoute from "./TeacherRoute";
import MyWorks from "../app/(authenticated)/student/my-works/page";
import WorkEvaluation from "../app/(authenticated)/teacher/workEvaluations/[id]/page";
import WorkEvaluations from "../app/(authenticated)/teacher/workEvaluations/page";

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
        <Route element={<AuthenticatedRoute />}>
          <Route path="my-works" element={<MyWorks />} />
          <Route path="work/edit/:id" element={<EditWork />} />
        </Route>
        <Route path="404" element={<NotFound />} />
        <Route element={<TeacherRoute />}>
          <Route path="rate-works" element={<WorkEvaluations />} />
          <Route path="rate-work/:id" element={<WorkEvaluation />} />
        </Route>
      </Route>

      <Route path="/pt" element={<LanguageRoute lang="pt" />}>
        <Route index element={<Home />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route path="trabalho/:id" element={<WorkDetail />} />
        <Route path="trabalho/novo" element={<NewWork />} />
        <Route element={<AuthenticatedRoute />}>
          <Route path="meus-trabalhos" element={<MyWorks />} />
          <Route path="trabalho/editar/:id" element={<EditWork />} />
        </Route>
        <Route path="404" element={<NotFound />} />
        <Route element={<TeacherRoute />}>
          <Route path="avaliar-trabalhos" element={<WorkEvaluations />} />
          <Route path="avaliar-trabalho/:id" element={<WorkEvaluation />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
