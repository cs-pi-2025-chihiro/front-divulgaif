import React, { useState } from 'react';
import './WorkTypeSelector.css';

const WorkTypeSelector = ({ onTypeChange }) => {
  const workTypes = ['Artigo', 'Pesquisa', 'Dissertação', 'Extensão', 'TCC'];
  const [selectedType, setSelectedType] = useState(workTypes[0]);

  const handleSelectType = (type) => {
    setSelectedType(type);
    if (onTypeChange) {
      onTypeChange(type);
    }
  };

  return (
    <div className="work-type-selector">
        {workTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={`type-button ${selectedType === type ? 'active' : ''}`}
            onClick={() => handleSelectType(type)}
          >
            {type}
          </button>
        ))}
    </div>
  );
};

export default WorkTypeSelector;