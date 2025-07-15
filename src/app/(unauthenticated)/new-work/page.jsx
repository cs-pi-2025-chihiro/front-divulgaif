import React, { useState } from "react";
import "./page.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button";
import {
  Input,
  AuthorInput,
  LabelInput,
  LinkInput,
} from "../../../components/input";
import ImageUpload from "../../../components/image-upload";
import mockedAuthors from "../../../data/mockedAuthors.json";
import mockedLabels from "../../../data/mockedLabels.json";
import mockedLinks from "../../../data/mockedLinks.json";
import WorkTypeSelector from "../../../components/work-type-selector/WorkTypeSelector";
import { isAuthenticated, hasRole } from "../../../services/hooks/auth/useAuth";
import { api } from "../../../services/utils/api";

const NewWork = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [labels, setLabels] = useState([]);
  const [links, setLinks] = useState([]);
  const [workType, setWorkType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [abstract, setAbstract] = useState("");
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const userIsAuthenticated = isAuthenticated();
  const isAdmin = hasRole("admin") || hasRole("Admin");
  const isCommon = hasRole("comum") || hasRole("common") || hasRole("Comum");

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "workType":
        if (!value) {
          newErrors.workType = t("errors.workTypeRequired");
        } else {
          delete newErrors.workType;
        }
        break;
      case "title":
        if (!value || value.trim() === "") {
          newErrors.title = t("errors.titleRequired");
        } else {
          delete newErrors.title;
        }
        break;
      case "authors":
        if (!value || value.length === 0) {
          newErrors.authors = t("errors.authorsRequired");
        } else {
          delete newErrors.authors;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!workType) {
      newErrors.workType = t("errors.workTypeRequired");
    }

    if (!title || title.trim() === "") {
      newErrors.title = t("errors.titleRequired");
    }

    if (authors.length === 0) {
      newErrors.authors = t("errors.authorsRequired");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join("\n");
      alert(errorMessages);
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleSendForReview();
    }
  };

  // Função para voltar à página anterior
  const handleBack = () => {
    navigate(-1);
  };

  // Função para salvar como rascunho
  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const formData = {
        workType,
        title,
        authors,
        description,
        abstract,
        labels,
        links,
        image,
        status: "draft",
      };

      // Simular chamada da API para salvar rascunho
      console.log("Salvando rascunho:", formData);

      // Aqui seria a chamada real para a API
      // const response = await api.post("/works/draft", formData);

      alert(t("messages.draftSaved") || "Rascunho salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error);
      alert(
        t("errors.saveDraftError") ||
          "Erro ao salvar rascunho. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Função para enviar para avaliação docente
  const handleSendForReview = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = {
        workType,
        title,
        authors,
        description,
        abstract,
        labels,
        links,
        image,
        status: "under_review",
      };

      console.log("Enviando para avaliação:", formData);

      // Aqui seria a chamada real para a API
      // const response = await api.post("/works/submit", formData);

      alert(
        t("messages.sentForReview") ||
          "Trabalho enviado para avaliação com sucesso!"
      );
      navigate(-1); // Voltar à página anterior após envio
    } catch (error) {
      console.error("Erro ao enviar trabalho:", error);
      alert(
        t("errors.submitError") || "Erro ao enviar trabalho. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Função para publicar diretamente (apenas Admin)
  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = {
        workType,
        title,
        authors,
        description,
        abstract,
        labels,
        links,
        image,
        status: "published",
      };

      console.log("Publicando trabalho:", formData);

      // Aqui seria a chamada real para a API
      // const response = await api.post("/works/publish", formData);

      alert(t("messages.published") || "Trabalho publicado com sucesso!");
      navigate(-1); // Voltar à página anterior após publicação
    } catch (error) {
      console.error("Erro ao publicar trabalho:", error);
      alert(
        t("errors.publishError") ||
          "Erro ao publicar trabalho. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkTypeChange = (selectedType) => {
    setWorkType(selectedType);
    validateField("workType", selectedType);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    validateField("title", value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleAbstractChange = (e) => {
    setAbstract(e.target.value);
  };

  const handleAuthorsChange = (newAuthors) => {
    setAuthors(newAuthors);
    validateField("authors", newAuthors);
  };

  const handleImageChange = (file) => {
    setImage(file);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="new-work-form">
        <div id="work-image-upload">
          <label>{t("new-work.workimage")}</label>
          <ImageUpload onImageChange={handleImageChange} />
        </div>

        <div id="work-type">
          <label>{t("new-work.worktype")}</label>
          <WorkTypeSelector onTypeChange={handleWorkTypeChange} />
          {errors.workType && (
            <span className="error-message">{errors.workType}</span>
          )}
        </div>

        <div id="work-title">
          <label>{t("new-work.worktitle")}</label>
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder={t("new-work.worktitle")}
            className={errors.title ? "field-error" : ""}
            required
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div id="work-authors">
          <label>{t("new-work.workauthors")}</label>
          <AuthorInput
            authors={authors}
            setAuthors={handleAuthorsChange}
            suggestions={mockedAuthors}
          />
          {errors.authors && (
            <span className="error-message">{errors.authors}</span>
          )}
        </div>

        <div id="work-description">
          <label>{t("new-work.workdescription")}</label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder={t("new-work.workdescription")}
          ></textarea>
        </div>

        <div id="work-abstract">
          <label>{t("new-work.workabstract")}</label>
          <textarea
            value={abstract}
            onChange={handleAbstractChange}
            placeholder={t("new-work.workabstract")}
          ></textarea>
        </div>

        <div id="work-labels">
          <label>Labels</label>
          <LabelInput
            labels={labels}
            setLabels={setLabels}
            suggestions={mockedLabels.labels}
          />
        </div>

        <div id="work-links">
          <label>Links</label>
          <LinkInput
            links={links}
            setLinks={setLinks}
            suggestions={mockedLinks.links}
          />
        </div>

        <div id="new-work-buttons">
          <Button onClick={handleBack} disabled={isLoading}>
            {t("common.back")}
          </Button>

          <Button onClick={handleSaveDraft} disabled={isLoading}>
            {isLoading ? t("common.loading") : t("common.save")}
          </Button>

          {/* Botão Enviar - apenas para usuários comuns autenticados */}
          {userIsAuthenticated && isCommon && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("new-work.send")}
            </Button>
          )}

          {/* Botão Publicar - apenas para administradores */}
          {userIsAuthenticated && isAdmin && (
            <Button onClick={handlePublish} disabled={isLoading}>
              {isLoading ? t("common.loading") : t("new-work.publish")}
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default NewWork;
