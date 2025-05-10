import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../button";
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
  
  const handleView = () => {
    
    navigate(`/trabalho/${id}`);
    
    
    if (onView) onView();
  };

  const cardContent = (
    <>
      <p className="work-card-authors">Autores: {authors}</p>
      <p className="work-card-description">{description}</p>
    </>
  );

  const cardFooter = (
    <div className="work-card-actions">
      <Button
        variant="secondary"
        size="sm"
        className="work-card-button"
        onClick={onEdit}
      >
        Editar
      </Button>
      <Button
        variant="primary"
        size="sm"
        className="work-card-button"
        onClick={handleView}
      >
        Visualizar
      </Button>
    </div>
  );

  return (
    <div>
      <Card
        className="work-card"
        imageUrl={imageUrl}
        imageAlt={title}
        title={title}
        content={cardContent}
        footer={cardFooter}
      />
    </div>
  );
};

export default WorkCard;