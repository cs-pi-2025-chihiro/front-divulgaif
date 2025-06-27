import React, { useState } from "react";
import "./page.css";
import { useTranslation } from "react-i18next";
import Button from "../../../components/button";
import { Input, AuthorInput, LabelInput } from "../../../components/input";
import mockedAuthors from "../../../data/mockedAuthors.json";
import mockedLabels from "../../../data/mockedLabels.json";

const NewWork = () => {
  const { t } = useTranslation();
  const [authors, setAuthors] = useState([]);
  const [labels, setLabels] = useState([]);

  const validateForm = () => {
    if (authors.length === 0) {
      alert("O campo de autores não pode ser nulo.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Formulário válido, enviando dados...");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="new-work-form">
        <div id="work-img"></div>

        <div id="work-type">
          <label>{t("new-work.worktype")}</label>
          <Input></Input>
        </div>

        <div id="work-title">
          <label>{t("new-work.worktitle")}</label>
          <Input></Input>
        </div>

        <div id="work-authors">
          <label>{t("new-work.workauthors")}</label>
          <AuthorInput
            authors={authors}
            setAuthors={setAuthors}
            suggestions={mockedAuthors}
          />
        </div>

        <div id="work-description">
          <label>{t("new-work.workdescription")}</label>
        </div>

        <div id="work-abstract">
          <label>{t("new-work.workabstract")}</label>
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