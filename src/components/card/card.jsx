import React from "react";
import "./card.css";
import Image from "../image/image";

const Card = ({
  children,
  className = "",
  imageUrl,
  imageAlt = "",
  title,
  content,
  footer,
  onClick,
}) => {
  const cardClassNames = `card ${className}`;
  return (
    <div className={cardClassNames} onClick={onClick}>
      {imageUrl && (
        <div className="card-image-container">
          <Image src={imageUrl} alt={imageAlt} className="card-image" />
        </div>
      )}
      <div className="card-content">
        {title && <h3 className="card-title">{title}</h3>}
        {content && <div className="card-body">{content}</div>}
        {footer && <div className="card-footer">{footer}</div>}
        {children}
      </div>
    </div>
  );
};

export default Card;
