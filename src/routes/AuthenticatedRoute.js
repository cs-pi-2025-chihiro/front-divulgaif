import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, hasRole } from "../services/hooks/auth/useAuth";
import { useTranslation } from "react-i18next";
import { ROLES } from "../enums/roles";

const AuthenticatedRoute = () => {
  const { i18n } = useTranslation();

  if (!isAuthenticated()) {
    return <Navigate to={`/${i18n.language}/404`} replace />;
  }

  if (!hasRole(ROLES.STUDENT) && !hasRole(ROLES.TEACHER)) {
    return <Navigate to={`/${i18n.language}/404`} replace />;
  }

  return <Outlet />;
};

export default AuthenticatedRoute;
