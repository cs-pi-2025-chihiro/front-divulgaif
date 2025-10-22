import React, { useState } from "react";
import "./header.css";
import { useTranslation } from "react-i18next";
import Button from "../button";
import {
  isAuthenticated,
  logout,
  hasRole,
} from "../../services/hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBars } from "react-icons/fa";
import Drawer from "../drawer/drawer";
import AuthButton from "../button/auth-button/auth-button";
import { aboutWebsite } from "../../constants";
import { navigateTo } from "../../services/utils/utils";


const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const authenticated = isAuthenticated();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile] = useState(window.innerWidth <= 768);

  const handleMyWorksNavigation = () => {
    const myWorksPath = currentLang === "pt" ? "meus-trabalhos" : "my-works";
    navigateTo(myWorksPath, navigate, currentLang);
  };

  const handleNewWorkNavigation = () => {
    const newWorkPath = currentLang === "pt" ? "trabalho/novo" : "work/new";
    navigateTo(newWorkPath, navigate, currentLang);
  };

    
  const handleLinksNavigation = () => {
    const linksPath = currentLang === "pt" ? "links" : "links"; 
    navigateTo(linksPath, navigate, currentLang);
  };


  const handleRateWorkNavigation = () => {
    const rateWorkPath =
      currentLang === "pt" ? "avaliar-trabalhos" : "rate-works";
    navigateTo(rateWorkPath, navigate, currentLang);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleLogin = () => {
    navigateTo("login", navigate, currentLang);
  };

  const handleLogout = () => {
    logout();
    navigateTo("", navigate, currentLang);
  };

  return (
    <>
      <div className="header">
        <div className="header-left" onClick={() => navigate("")}>
          <h1 style={{ cursor: "pointer" }}>DivulgaIF</h1>
        </div>
        <div className="header-center">
          <a onClick={() => navigate("")}>{t("header.mainSearch")}</a>
          {authenticated && (
            <a onClick={handleMyWorksNavigation}> {t("header.myWorks")}</a>
          )}
                    {}

          {authenticated && hasRole(ROLES.TEACHER) && (
            <a onClick={handleLinksNavigation}> {t("header.links") || "Links"}</a>
          )}

          {}

          {authenticated && hasRole(ROLES.TEACHER) && (
            <a onClick={handleRateWorkNavigation}> {t("header.rateWorks")}</a>
          )}
          <a style={{ cursor: "pointer" }} onClick={handleNewWorkNavigation}>
            {t("home.newWork")}
          </a>
          <a
            onClick={() => {
              window.location.href = aboutWebsite;
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
