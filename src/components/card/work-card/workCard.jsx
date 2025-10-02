import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./workCard.css";

const WorkCard = ({
  id,
  title,
  authors,
  approvedAt,
  labels,
  description,
  imageUrl = "/default-image.jpg",
  onEdit,
  onView,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleCardClick = () => {
    if (!id) return;
    const workId = String(id);
    const currentLang = i18n.language;
    const workPath = currentLang === "pt" ? "trabalho" : "work";
    navigate(`/${currentLang}/${workPath}/${workId}`);
    if (onView) onView();
  };

  const primaryLink =
    Array.isArray(authors) && authors.length > 0
      ? authors[0].link || authors[0].url
      : null;

  return (
    <div className="work-card-new" onClick={handleCardClick}>
      <div className="work-card-image-container">
        <img src={imageUrl} alt={title} className="work-card-image" />
      </div>

      <div className="work-card-title-section">
        <h3 className="work-card-title">{title}</h3>
        {primaryLink && (
          <a
            href={primaryLink}
            className="work-card-primary-link"
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver mais
          </a>
        )}
      </div>

      <p className="work-card-description">{description}</p>

      <div className="work-card-authors-date-section">
        <div className="work-card-authors">
          {Array.isArray(authors) &&
            authors.slice(0, 2).map((author, idx) => (
              <span key={idx} className="work-card-author">
                {author.name || author}
                {idx < Math.min(authors.length - 1, 1) && ", "}
              </span>
            ))}
        </div>
        <span className="work-card-date">{approvedAt}</span>
      </div>

      <div className="work-card-labels">
        {Array.isArray(labels) &&
          labels.slice(0, 3).map((label, idx) => (
            <span className="work-card-label" key={idx}>
              {label.name || label}
            </span>
          ))}
      </div>
    </div>
  );
};

export default WorkCard;
