import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, hasRole } from "../services/hooks/auth/useAuth";
import { useTranslation } from "react-i18next";

const StudentRoute = () => {
  const { i18n } = useTranslation();

  if (!isAuthenticated()) {
    return <Navigate to={`/${i18n.language}/404`} replace />;
  }

  if (!hasRole("IS_STUDENT")) {
    return <Navigate to={`/${i18n.language}/404`} replace />;
  }

  return <Outlet />;
};

export default StudentRoute;
