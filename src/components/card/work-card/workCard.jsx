import React from "react";
import Button from "../../button";
import Card from "../card";
import "./workCard.css";

const WorkCard = ({
  title,
  authors,
  date,
  labels,
  description,
  imageUrl = "/default-image.jpg",
  onEdit,
  onView,
}) => {
  const cardContent = (
    <>
      <p className="work-card-description">{description}</p>

      <div className="work-card-authors-date">
        <p className="work-card-authors">{authors}</p>
        <p className="work-card-date">{date}</p>
      </div>

      <div className="work-card-labels"> 
        {Array.isArray(labels) &&
          labels.slice(0,4).map((label, idx) => (
            <span className="work-card-label" key={idx}>
              {label}
            </span>
          ))}
      </div>
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
        onClick={onView}
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
