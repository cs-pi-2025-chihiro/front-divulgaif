import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./WorkTypeSelector.css";

const WorkTypeSelector = ({ onTypeChange, selectedType: initialSelectedType }) => {
  const { t } = useTranslation();
  const workTypes = [
    { key: "ARTICLE", label: t("workTypes.article") },
    { key: "RESEARCH", label: t("workTypes.research") },
    { key: "DISSERTATION", label: t("workTypes.dissertation") },
    { key: "EXTENSION", label: t("workTypes.extension") },
    { key: "FINAL_THESIS", label: t("workTypes.finalThesis") },
  ];
  const [selectedType, setSelectedType] = useState(initialSelectedType || "");

  useEffect(() => {
    setSelectedType(initialSelectedType || "");
  }, [initialSelectedType]);


  const handleSelectType = (type) => {
    setSelectedType(type.key);
    if (onTypeChange) {
      onTypeChange(type.key);
    }
  };

  return (
    <div className="work-type-selector">
      {workTypes.map((type) => (
        <button
          key={type.key}
          type="button"
          className={`type-button ${selectedType === type.key ? "active" : ""}`}
          onClick={() => handleSelectType(type)}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};

export default WorkTypeSelector;