import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../card";
import "./workCard.css";

const WorkCard = ({
  id, 
  title,
  authors,
  description,
  imageUrl = "/default-image.jpg",
  onEdit,
  onView,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const handleCardClick = () => {
    
    if (!id) {
      console.error("WorkCard: No ID provided for navigation");
      return;
    }
    
    
    const workId = String(id);
    
    
    const currentLang = i18n.language;
    
    
    const workPath = currentLang === 'pt' ? 'trabalho' : 'work';
    
    
    console.log(`Navigating to: /${currentLang}/${workPath}/${workId}`);
    
    
    navigate(`/${currentLang}/${workPath}/${workId}`);
    
    
    if (onView) onView();
  };

  
  const truncatedDescription = description && description.length > 100 
    ? `${description.substring(0, 100)}...` 
    : description;

  return (
    <div className="work-card-wrapper">
      <Card
        className="work-card"
        imageUrl={imageUrl}
        imageAlt={title}
        title={title}
        content={
          <>
            <p className="work-card-authors">{t(authors)}:</p>
            <p className="work-card-description">{truncatedDescription}</p>
          </>
        }
        onClick={handleCardClick}
      />
    </div>
  );
};

export default WorkCard;