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
  
  useEffect(() => {
    // Log for debugging
    console.log("WorkDetail component - ID from params:", id);
    console.log("Available works:", mockedValues.trabalhos);
    
    // Find the work with the matching ID
    // Note: Convert both IDs to strings for comparison to ensure type consistency
    const foundWork = mockedValues.trabalhos.find(
      (work) => String(work.id) === String(id)
    );
    
    // Log what we found
    console.log("Found work:", foundWork);
    
    if (foundWork) {
      setWork(foundWork);
    } else {
      console.error(`Work with ID ${id} not found in mocked data.`);
    }
    
    setLoading(false);
  }, [id]);

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
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
          <p>ID requested: {id}</p>
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleGoBack}
            className="mt-4"
          >
            {t("common.goBack") || "Go Back"}
          </Button>
        </div>
      </div>
    );
  }

  // Safe access to work type with fallback
  const workType = work.type ? work.type.toLowerCase() : 'unknown';

  return (
    <div className="work-detail-container">
      <Button 
        variant="tertiary" 
        size="md" 
        onClick={handleGoBack}
        className="back-button"
      >
        &larr; {t("common.goBack") || "Go Back"}
      </Button>
      
      <div className="work-detail-header">
        <h1 className="work-detail-title">{work.title}</h1>
        {/* Fixed: Safely access type property */}
        <p className="work-detail-type">
          {work.type ? t(`workTypes.${workType}`) || work.type : t("workTypes.unknown") || "Unknown type"}
        </p>
        <p className="work-detail-id">ID: {work.id}</p>
      </div>
      
      {work.imageUrl && (
        <div className="work-detail-image-container">
          <img src={work.imageUrl} alt={work.title} className="work-detail-image" />
        </div>
      )}
      
      <div className="work-detail-content">
        <div className="work-detail-metadata">
          <h2>{t("workDetail.authors") || "Authors"}</h2>
          <p className="work-detail-authors">{work.authors}</p>
          
          <h2>{t("workDetail.publishDate") || "Publication Date"}</h2>
          <p className="work-detail-date">
            {work.date ? new Date(work.date).toLocaleDateString() : t("common.notAvailable") || "Not available"}
          </p>
        </div>
        
        <div className="work-detail-description">
          <h2>{t("workDetail.abstract") || "Abstract"}</h2>
          <p>{work.description || t("common.noDescription") || "No description available"}</p>
        </div>
        
        {work.keywords && work.keywords.length > 0 && (
          <div className="work-detail-keywords">
            <h2>{t("workDetail.keywords") || "Keywords"}</h2>
            <div className="keywords-list">
              {work.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {work.download && (
          <div className="work-detail-actions">
            <Button variant="primary" size="lg">
              {t("workDetail.download") || "Download"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkDetail;