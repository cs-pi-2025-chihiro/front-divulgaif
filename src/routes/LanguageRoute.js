import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function LanguageRoute({ lang }) {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n, location]);

  return <Outlet />;
}

export default LanguageRoute;
