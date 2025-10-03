import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./filter-input.css";

const FilterInput = ({ selectedFilters, setSelectedFilters, getSuggestions }) => {
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
          (suggestion) => !selectedFilters.some((filter) => filter.id === suggestion.id)
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

  const addFilterFromSuggestion = (filter) => {
    setSelectedFilters([...selectedFilters, filter]);
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const removeFilter = (filterToRemove) => {
    setSelectedFilters(selectedFilters.filter((filter) => filter.id !== filterToRemove.id));
  };

  return (
    <div className="custom-filter-container" ref={containerRef}>
      <div className="filter-main-box">
        <div className="filter-tags-container">
          {selectedFilters.map((filter) => (
            <div key={filter.id} className="filter-label-tag">
              {filter.name}
              <button
                type="button"
                className="remove-filter-button"
                onClick={() => removeFilter(filter)}
              >
                &times;
              </button>
            </div>
          ))}
          <input
            type="text"
            className="filter-input"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={t("filter.searchLabel")}
          />
          {isLoading && (
            <div className="filter-loading-indicator">{t("filter.loading")}...</div>
          )}
        </div>
      </div>

      {filteredSuggestions.length > 0 && (
        <ul className="filter-suggestions-list">
          {filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => addFilterFromSuggestion(suggestion)}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterInput;