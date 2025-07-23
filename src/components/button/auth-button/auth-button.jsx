import React from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";
import Button from "../button";
import "./auth-button.css";

const AuthButton = ({
  isAuthenticated,
  onLogin,
  onLogout,
  className = "secondary",
  variant = "secondary",
  size = "md",
  ...props
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (isAuthenticated) {
      onLogout();
    } else {
      onLogin();
    }
  };

  const buttonText = isAuthenticated ? t("common.logout") : t("common.login");
  const ariaLabel = isAuthenticated ? t("common.logout") : t("common.login");

  return (
    <Button
      type="button"
      className={`${className} auth-button-fixed-width`}
      variant={variant}
      size={size}
      ariaLabel={ariaLabel}
      onClick={handleClick}
      {...props}
    >
      <FaUser /> {buttonText}
    </Button>
  );
};

export default AuthButton;
