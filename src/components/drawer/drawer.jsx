import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaSignOutAlt } from "react-icons/fa";
import { t } from "i18next";
import { hasRole, logout } from "../../services/hooks/auth/useAuth";
import { ROLES } from "../../enums/roles";
import { navigateTo } from "../../services/utils/utils";
import { aboutWebsite } from "../../constants";

const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease-in-out;
`;

const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100%;
  background-color: var(--container-green);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  transform: translateX(${(props) => (props.isOpen ? "0" : "100%")});
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  font-family: "Montserrat", sans-serif;

  @media (min-width: 769px) {
    display: none;
  }
`;

const DrawerHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--dark-green);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--darker-green);
`;

const DrawerTitle = styled.h3`
  color: white;
  margin: 0;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 18px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--dark-green);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const DrawerLink = styled.a`
  color: white;
  text-decoration: none;
  padding: 18px 20px;
  font-size: 16px;
  font-weight: 400;

  svg {
    margin-right: 12px;
    font-size: 18px;
  }

  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--dark-green);
  display: flex;
  align-items: center;
  position: relative;

  &:hover {
    background-color: var(--dark-green);
    padding-left: 25px;
  }

  &:active {
    background-color: var(--darker-green);
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background-color: var(--accent-orange);
    transform: scaleY(0);
    transition: transform 0.2s ease;
  }

  &:hover::before {
    transform: scaleY(1);
  }
`;

const DrawerSection = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid var(--dark-green);
`;

const Drawer = ({ isOpen, onClose, isAuthenticated }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const handleMyWorksNavigation = () => {
    const myWorksPath = currentLang === "pt" ? "meus-trabalhos" : "my-works";
    navigateTo(myWorksPath, navigate, currentLang);
    onClose();
  };

  const handleNewWorkNavigation = () => {
    const newWorkPath = currentLang === "pt" ? "trabalho/novo" : "work/new";
    navigateTo(newWorkPath, navigate, currentLang);
    onClose();
  };

  const handleRateWorkNavigation = () => {
    const rateWorkPath =
      currentLang === "pt" ? "avaliar-trabalhos" : "rate-works";
    navigateTo(rateWorkPath, navigate, currentLang);
    onClose();
  };

  const handleMainSearchNavigation = () => {
    navigateTo("", navigate, currentLang);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigateTo("", navigate, currentLang);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <DrawerOverlay isOpen={isOpen} onClick={onClose} />
      <DrawerContainer isOpen={isOpen}>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </DrawerHeader>

        <DrawerContent>
          <DrawerSection>
            <div>
              <DrawerLink onClick={handleMainSearchNavigation}>
                {t("header.mainSearch")}
              </DrawerLink>
              {isAuthenticated && (
                <DrawerLink onClick={handleMyWorksNavigation}>
                  {t("header.myWorks")}
                </DrawerLink>
              )}
              {isAuthenticated && hasRole(ROLES.TEACHER) && (
                <DrawerLink onClick={handleRateWorkNavigation}>
                  {t("header.rateWorks")}
                </DrawerLink>
              )}
              <DrawerLink onClick={handleNewWorkNavigation}>
                {t("home.newWork")}
              </DrawerLink>
              <DrawerLink
                onClick={() => {
                  window.location.href = aboutWebsite;
                }}
              >
                {t("header.about")}
              </DrawerLink>
            </div>
          </DrawerSection>

          {isAuthenticated && (
            <DrawerSection>
              <DrawerLink onClick={handleLogout}>
                <FaSignOutAlt />
                {t("common.logout")}
              </DrawerLink>
            </DrawerSection>
          )}
        </DrawerContent>
      </DrawerContainer>
    </>
  );
};

export default Drawer;
