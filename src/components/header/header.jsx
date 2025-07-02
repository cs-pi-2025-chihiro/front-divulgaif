import "./header.css";
import { useTranslation } from "react-i18next";
import Button from "../button";
import { isAuthenticated, logout } from "../../services/hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";

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
      <div className="header-left" onClick={() => navigateTo("")}>
        <h1 style={{ cursor: "pointer" }}>DivulgaIF</h1>
      </div>

      <div className="header-center">
        <a onClick={() => navigateTo("/busca")}>Busca Principal</a>
        <a onClick={() => navigateTo("/meus-trabalhos")}>Meus Trabalhos</a>
        <a onClick={() => navigateTo("/sobre")}>Sobre o Projeto</a>
      </div>

      <div className="header-right">
        {authenticated ? (
          <Button
  type="button"
  className="login-style"
  ariaLabel={t("common.login")}
  onClick={() => navigateTo("/login")}
>
  <FaUser /> {t("common.login")}
</Button>

        ) : (
          <Button
            type="button"
            className="secondary"
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
