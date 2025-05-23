import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/button";
import "./page.css";
import mockedValues from "../../../../data/mockedValues.json";

const WorkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    
    console.log("WorkDetail component - ID from params:", id);
    console.log("Available works:", mockedValues.trabalhos);
    

    const foundWork = mockedValues.trabalhos.find(
      (work) => String(work.id) === String(id)
    );
    
    
    console.log("Found work:", foundWork);
    
    if (foundWork) {
      setWork(foundWork);
    }
    
    setLoading(false);
  }, [id]);

  const handleGoBack = () => {
    navigate(-1); 
  };

  
  const navigateImage = (direction) => {
    if (!work || !work.images || work.images.length <= 1) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % work.images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + work.images.length) % work.images.length);
    }
  };

  if (loading) {
    return (
      <div className="work-detail-container">
        <div className="loading-indicator">{t("common.loading") || "Loading"}...</div>
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
            variant="primary" 
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

  
  const workType = work.type ? work.type.toLowerCase() : 'unknown';

  
  const images = work.images || (work.imageUrl ? [work.imageUrl] : []);

  return (
    <div className="work-detail-container">
      {}
      <Button 
        variant="tertiary" 
        size="md" 
        onClick={handleGoBack}
        className="back-button"
      >
        &larr; {t("common.back") || "Voltar"}
      </Button>
      
      {}
      <div className="work-detail-header">
        <h1 className="work-detail-title">{work.title}</h1>
        {work.type && (
          <p className="work-detail-type">
            {t(`workTypes.${workType}`) || work.type}
          </p>
        )}
        <p className="work-detail-id">ID: {work.id}</p>
      </div>
      
      {}
      {images.length > 0 && (
        <div className="work-detail-image-container">
          <div className="image-carousel">
            <img 
              src={images[currentImageIndex]} 
              alt={`${work.title} - ${currentImageIndex + 1}`} 
              className="work-detail-image" 
            />
          </div>
        </div>
      )}
      
      {}
      <div className="work-detail-content">
        <div className="work-detail-metadata">
          <h2>{t("workDetail.authors") || "Autores"}</h2>
          <p className="work-detail-authors">{work.authors}</p>
          
          {}
          {work.advisor && (
            <>
              <h2>{t("workDetail.advisor") || "Professor Responsável"}</h2>
              <p className="work-detail-advisor">{work.advisor}</p>
            </>
          )}
          
          {}
          <h2>{t("workDetail.publishDate") || "Data de Publicação"}</h2>
          <p className="work-detail-date">
            {work.date 
              ? new Date(work.date).toLocaleDateString(i18n.language) 
              : t("common.notAvailable") || "Não disponível"}
          </p>
        </div>
        
        {}
        <div className="work-detail-description">
          <h2>{t("workDetail.abstract") || "Resumo"}</h2>
          <p className="work-detail-abstract">
            {work.description || t("common.noDescription") || "Nenhuma descrição disponível"}
          </p>
        </div>
      </div>
      
      {}
      {work.keywords && work.keywords.length > 0 && (
        <div className="work-detail-keywords">
          <h2>{t("workDetail.keywords") || "Palavras-chaves"}</h2>
          <div className="keywords-list">
            {work.keywords.map((keyword, index) => (
              <span key={index} className="keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {}
      {work.additionalLinks && work.additionalLinks.length > 0 && (
        <div className="work-detail-links">
          <h2>{t("workDetail.additionalLinks") || "Links Adicionais"}</h2>
          <ul className="additional-links-list">
            {work.additionalLinks.map((link, index) => (
              <li key={index}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.title || `${t("workDetail.link") || "Link"} ${index + 1}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {}
    </div>
  );
};

export default WorkDetail;