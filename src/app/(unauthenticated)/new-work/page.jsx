import React, { useEffect, useState } from "react";
import "./page.css";
import { useTranslation } from "react-i18next";
import Button from "../../../components/button";
import { Input } from "../../../components/input";

const NewWork = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <form action="">
        <div id="work-img">
          
        </div>

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
        </div>

        <div id="work-description">
          <label>{t("new-work.workdescription")}</label>
        </div>

        <div id="work-abstract">
          <label>{t("new-work.workabstract")}</label>
        </div>

        <div id="work-labels">
          <label>Labels</label>
        </div>

        <div id="work-links">
          <label>Links</label>
        </div>
    
        <div id="new-work-buttons">
          <Button>{t("common.back")}</Button>
          <Button>{t("common.save")}</Button>
          <Button>{t("new-work.send")}</Button>
          <Button>{t("new-work.publish")}</Button>
        </div>
      </form>
    </>
  );
};

export default NewWork;
