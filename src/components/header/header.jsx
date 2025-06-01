import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../button";
import "./header.css";
import { isAuthenticated, logout } from "../../services/hooks/auth/useAuth";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const authenticated = isAuthenticated();

  const navigateTo = (path) => {
    navigate(`/${currentLang}${path}`);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="header">
      <h1 onClick={() => navigateTo("")} style={{ cursor: "pointer" }}>
        DivulgaIF
      </h1>

      <div>
        {authenticated ? (
          <Button
            type="button"
            className="primary"
            variant="secondary"
            ariaLabel={t("common.logout")}
            children={t("common.logout")}
            onClick={handleLogout}
          />
        ) : (
          <Button
            type="button"
            className="primary"
            variant="secondary"
            ariaLabel={t("common.login")}
            children={t("common.login")}
            onClick={() => navigateTo("/login")}
          />
        )}
      </div>
    </div>
  );
};

export default Header;
