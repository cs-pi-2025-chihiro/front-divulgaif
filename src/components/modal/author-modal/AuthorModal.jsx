import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../modal";
import Input from "../../input/input";
import Button from "../../button/button";
import "./AuthorModal.css";

const AuthorModal = ({
  isOpen,
  onClose,
  onSave,
  authorData,
  mode = "create",
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && authorData) {
        setName(authorData.name || "");
        setEmail(authorData.email || "");
      } else {
        setName("");
        setEmail("");
      }
      setError("");
    }
  }, [isOpen, mode, authorData]);

  const handleSave = () => {
    if (!name.trim()) {
      setError(t("authors.modal.nameRequired", "Author name cannot be empty."));
      return;
    }
    if (!email.trim()) {
      setError(
        t("authors.modal.emailRequired", "Author email cannot be empty.")
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(
        t("authors.modal.emailInvalid", "Please enter a valid email address.")
      );
      return;
    }

    setError("");
    const dataToSave =
      mode === "edit" && authorData?.id
        ? { id: authorData.id, name: name.trim(), email: email.trim() }
        : { name: name.trim(), email: email.trim() };
    onSave(dataToSave);
  };

  const title =
    mode === "edit"
      ? t("authors.modal.editTitle", "Edit Author")
      : t("authors.modal.createTitle", "Create New Author");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width="medium">
      <div className="author-modal-content">
        <div className="form-group">
          <label htmlFor="authorName">
            {t("authors.modal.nameLabel", "Author Name")}:
          </label>
          <Input
            id="authorName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(
              "authors.modal.namePlaceholder",
              "Enter author name"
            )}
            className={`author-modal-input ${error ? "input-error" : ""}`}
          />
        </div>
        <div className="form-group">
          <label htmlFor="authorEmail">
            {t("authors.modal.emailLabel", "Author Email")}:
          </label>
          <Input
            id="authorEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t(
              "authors.modal.emailPlaceholder",
              "Enter author email"
            )}
            className={`author-modal-input ${error ? "input-error" : ""}`}
          />
        </div>
        {error && <p className="author-modal-error">{error}</p>}
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>
          {t("common.cancel", "Cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("common.save", "Save")}
        </Button>
      </div>
    </Modal>
  );
};

export default AuthorModal;
