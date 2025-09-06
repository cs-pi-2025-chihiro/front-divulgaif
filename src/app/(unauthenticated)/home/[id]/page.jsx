import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/button";
import "./page.css";
import { useWork } from "./useWork";

const WorkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const workId = Number(id);

  const { work, isLoading } = useWork({ id: workId });

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="work-detail-container">
        <div className="loading-indicator">
          {t("common.loading") || "Loading"}
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="work-detail-container">
        <div className="error-message">
          {t("errors.workNotFound") || "Work not found"}
          <p>ID: {id}</p>
          <Button
            variant="secondary"
            size="md"
            onClick={handleGoBack}
            className="mt-4"
          >
            {t("common.back") || "Voltar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="work-detail-container">
      <div className="work-detail-header-wrapper">
        <div className="work-detail-header">
          <h1 className="work-detail-title">{work.title}</h1>
          {work.type && (
            <p className="work-detail-type">
              {t(`${work.type.toLowerCase()}`)}
            </p>
          )}
        </div>
        {work.authors && work.authors.length > 0 && (
          <div className="work-detail-keywords">
            <div className="work-detail-authors">
              {work.authors.map((author, index) => (
                <span key={index} className="keyword-tag">
                  {author.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="work-detail-image-container">
        <div className="image-carousel">
          <img
            src={work.imageUrl}
            alt={`${work.title}`}
            className="work-detail-image"
          />
        </div>
      </div>
      <div className="work-detail-description">
        <h2>{t("workDetail.abstract") || "Resumo"}</h2>
        <p className="work-detail-abstract">
          {work.description ||
            t("common.noDescription") ||
            "Nenhuma descrição disponível"}
        </p>
      </div>
      <div className="work-detail-content">
        <div className="work-detail-metadata">
          {work.teachers && (
            <>
              <h2>{t("workDetail.advisor") || "Professor Responsável"}</h2>
              <p className="work-detail-advisor">{work.teachers.name}</p>
            </>
          )}

          <h2>{t("workDetail.publishDate") || "Data de Publicação"}</h2>
          <p className="work-detail-date">
            {work.date
              ? new Date(work.date).toLocaleDateString(i18n.language)
              : t("common.notAvailable") || "Não disponível"}
          </p>
        </div>
      </div>
      {work.labels && work.labels.length > 0 && (
        <div className="work-detail-keywords">
          <h2>{t("workDetail.keywords") || "Palavras-chaves"}</h2>
          <div className="keywords-list">
            {work.labels.map((label, index) => (
              <span key={index} className="keyword-tag">
                {label.name}
              </span>
            ))}
          </div>
        </div>
      )}
      {work.links && work.links.length > 0 && (
        <div className="work-detail-links">
          <h2>{t("workDetail.additionalLinks") || "Links Adicionais"}</h2>
          <ul className="additional-links-list">
            {work.links.map((link, index) => (
              <li>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.title ||
                    `${t("workDetail.link") || "Link"} ${index + 1}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkDetail;
