import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/hooks/auth/useAuth";
import { useTranslation } from "react-i18next";

const GuestRoute = () => {
  const { i18n } = useTranslation();

  if (isAuthenticated()) {
    return <Navigate to={`/${i18n.language}`} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
