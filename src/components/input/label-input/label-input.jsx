import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./label-input.css";

const LabelInput = ({ labels, setLabels, getSuggestions }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value && value.length >= 2) {
      setIsLoading(true);
      try {
        const suggestions = await getSuggestions(value);
        const filtered = suggestions.filter(
          (suggestion) => !labels.some((label) => label.id === suggestion.id)
        );
        setFilteredSuggestions(filtered);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        setFilteredSuggestions([]);
      } finally {
        setIsLoading(false);
      }
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

    if (
      !labels.some(
        (label) =>
          label.name && label.name.toLowerCase() === trimmedValue.toLowerCase()
      )
    ) {
      const newLabel = {
        id: `new_${Date.now()}`,
        name: trimmedValue,
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
              {label.name}
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
            placeholder={t("new-work.searchLabel")}
          />
          {isLoading && (
            <div className="loading-indicator">{t("new-work.loading")}...</div>
          )}
        </div>

        <div className="add-input-button-container">
          <button
            type="button"
            className="add-input-button"
            onClick={addNewLabel}
          >
            +
          </button>
        </div>
      </div>

      {filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => addLabelFromSuggestion(suggestion)}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LabelInput;
