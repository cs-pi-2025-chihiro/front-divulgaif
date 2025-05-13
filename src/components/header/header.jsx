import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../button";
import "./header.css";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const navigateTo = (path) => {
    navigate(`/${currentLang}${path}`);
  };

  return (
    <div className="header">
      <h1 onClick={() => navigateTo("")} style={{ cursor: "pointer" }}>
        DivulgaIF
      </h1>

      <div>
        <Button
          type="submit"
          className="primary"
          variant="secondary"
          ariaLabel={t("common.login")}
          children={t("common.login")}
          onClick={() => navigateTo("/login")}
        />
      </div>
    </div>
  );
};

export default Header;
