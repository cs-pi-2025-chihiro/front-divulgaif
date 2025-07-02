import React, { useState, useRef, useEffect } from "react";
import "./label-input.css";

const LabelInput = ({
  labels,
  setLabels,
  suggestions = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.label.toLowerCase().startsWith(value.toLowerCase()) &&
          !labels.some((label) => label.id === suggestion.id)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const addLabelFromSuggestion = (label) => {
    setLabels([...labels, label]);
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const addNewLabel = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === "") return;

    if (!labels.some(label => label.label.toLowerCase() === trimmedValue.toLowerCase())) {
      const newLabel = {
        id: `new_${Date.now()}`,
        label: trimmedValue,
      };
      setLabels([...labels, newLabel]);
    }
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const removeLabel = (labelToRemove) => {
    setLabels(labels.filter((label) => label.id !== labelToRemove.id));
  };

  return (
    <div className="custom-autocomplete-container" ref={containerRef}>
      <div className="autocomplete-main-box">
        <div className="tags-container">
          {labels.map((label) => (
            <div key={label.id} className="label-tag">
              {label.label}
              <button
                type="button"
                className="remove-tag-button"
                onClick={() => removeLabel(label)}
              >
                &times;
              </button>
            </div>
          ))}
          <input
            type="text"
            className="autocomplete-input"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Buscar label..."
          />
        </div>

        <div className="add-input-button-container">
          <button type="button" className="add-input-button" onClick={addNewLabel}>
            +
          </button>
        </div>
      </div>

      {filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion.id} onClick={() => addLabelFromSuggestion(suggestion)}>
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LabelInput;