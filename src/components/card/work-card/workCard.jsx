import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../card";
import "./workCard.css";

const WorkCard = ({
  id,
  title,
  authors,
  date,
  labels,
  description,
  imageUrl = "/default-image.jpg",
  onEdit,
  onView,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const cardContent = (
    <>
      <p className="work-card-description">{description}</p>

      <div className="work-card-authors-date">
        {Array.isArray(authors) &&
          authors.slice(0, 4).map((author, idx) => (
            <div className="work-card-authors" key={idx}>
              {author.name}
            </div>
          ))}
        <p className="work-card-date">{date}</p>
      </div>

      <div className="work-card-labels">
        {Array.isArray(labels) &&
          labels.slice(0, 4).map((label, idx) => (
            <span className="work-card-label" key={idx}>
              {label.name}
            </span>
          ))}
      </div>
    </>
  );

  const handleCardClick = () => {
    if (!id) return;

    const workId = String(id);
    const currentLang = i18n.language;
    const workPath = currentLang === "pt" ? "trabalho" : "work";

    navigate(`/${currentLang}/${workPath}/${workId}`);

    if (onView) onView();
  };

  return (
    <div className="work-card-wrapper">
      <Card
        className="work-card"
        imageUrl={imageUrl}
        imageAlt={title}
        title={title}
        description={description}
        content={cardContent}
        onClick={handleCardClick}
      />
    </div>
  );
};

export default WorkCard;
