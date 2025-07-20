import React, { useState } from "react";
import "./header.css";
import { useTranslation } from "react-i18next";
import Button from "../button";
import { isAuthenticated, logout } from "../../services/hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBars } from "react-icons/fa";
import Drawer from "../drawer/drawer";
import AuthButton from "../button/auth-button/auth-button";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const authenticated = isAuthenticated();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile] = useState(window.innerWidth <= 768);

  const navigateTo = (path) => {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const fullPath = cleanPath
      ? `/${currentLang}/${cleanPath}`
      : `/${currentLang}`;
    navigate(fullPath);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleLogin = () => {
    navigateTo("/login");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="header">
        <div className="header-left" onClick={() => navigateTo("")}>
          <h1 style={{ cursor: "pointer" }}>DivulgaIF</h1>
        </div>
        <div className="header-center">
          <a onClick={() => navigateTo("")}>{t("header.mainSearch")}</a>
          {authenticated && (
            <a onClick={() => navigateTo("/meus-trabalhos")}>
              {" "}
              {/* TODO: APLICAR ISSO QUANDO TERMINARMOS A PÁGINA */}
              {t("header.myWorks")}
            </a>
          )}
          <a
            onClick={() => {
              window.location.href =
                "https://chihiro-front.s3.sa-east-1.amazonaws.com/team-chihiro-front/sobre-produto-eduardo/pagina.html";
            }}
          >
            {t("header.about")}
          </a>
        </div>
        <div className="header-right">
          <div className="desktop-auth">
            <AuthButton
              isAuthenticated={authenticated}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          </div>
          {isMobile && (
            <Button className="mobile-menu-btn" onClick={toggleDrawer}>
              <FaBars />
            </Button>
          )}
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        isAuthenticated={authenticated}
      />
    </>
  );
};

export default Header;
