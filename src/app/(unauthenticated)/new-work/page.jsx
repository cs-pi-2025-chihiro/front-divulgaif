import React, { useState } from "react";
import "./page.css";
import { useTranslation } from "react-i18next";
import Button from "../../../components/button";
import {
  Input,
  AuthorInput,
  LabelInput,
  LinkInput,
} from "../../../components/input";
import mockedAuthors from "../../../data/mockedAuthors.json";
import mockedLabels from "../../../data/mockedLabels.json";
import mockedLinks from "../../../data/mockedLinks.json";
import WorkTypeSelector from "../../../components/work-type-selector/WorkTypeSelector";

const NewWork = () => {
  const { t } = useTranslation();
  const [authors, setAuthors] = useState([]);
  const [labels, setLabels] = useState([]);
  const [links, setLinks] = useState([]);
  const [workType, setWorkType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [abstract, setAbstract] = useState("");
  const [errors, setErrors] = useState({});

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
      console.log("Formulário válido, enviando dados...");
      const formData = {
        workType,
        title,
        authors,
        description,
        abstract,
        labels,
        links,
      };
      console.log("Dados do formulário:", formData);
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

  return (
    <>
      <form onSubmit={handleSubmit} id="new-work-form">
        <div id="work-img"></div>

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
          <Button>{t("common.back")}</Button>
          <Button>{t("common.save")}</Button>
          <Button type="submit">{t("new-work.send")}</Button>
          <Button>{t("new-work.publish")}</Button>
        </div>
      </form>
    </>
  );
};

export default NewWork;
