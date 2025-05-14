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
  const { i18n } = useTranslation();
  
  const handleCardClick = () => {
    // Make sure we have a valid ID
    if (!id) {
      console.error("WorkCard: No ID provided for navigation");
      return;
    }
    
    // Convert ID to string to ensure consistent formatting
    const workId = String(id);
    
    // Determine the current language
    const currentLang = i18n.language;
    
    // Use the appropriate path based on language
    const workPath = currentLang === 'pt' ? 'trabalho' : 'work';
    
    // Log the navigation for debugging
    console.log(`Navigating to: /${currentLang}/${workPath}/${workId}`);
    
    // Navigate to the work detail page
    navigate(`/${currentLang}/${workPath}/${workId}`);
    
    // Call the onView function if provided
    if (onView) onView();
  };

  // Render content only if we have a valid ID
  const cardContent = (
    <>
      <p className="work-card-authors">Autores: {authors}</p>
      <p className="work-card-description">{description}</p>
    </>
  );

  return (
    <div className="work-card-wrapper">
      <Card
        className="work-card"
        imageUrl={imageUrl}
        imageAlt={title}
        title={title}
        content={cardContent}
        onClick={handleCardClick}
      />
    </div>
  );
};

export default WorkCard;