import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/hooks/auth/useAuth";
import { useTranslation } from "react-i18next";

const GuestRoute = () => {
  const { i18n } = useTranslation();

  if (isAuthenticated()) {
    // If user is already authenticated, redirect to home
    return <Navigate to={`/${i18n.language}`} replace />;
  }

  // If user is not authenticated, allow access to guest routes (login, register)
  return <Outlet />;
};

export default GuestRoute;
