import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./link-input.css";

const LinkInput = ({ links, setLinks, getSuggestions }) => {
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
          (suggestion) => !links.some((link) => link.id === suggestion.id)
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

  const addLinkFromSuggestion = (link) => {
    setLinks([...links, link]);
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const addNewLink = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === "") return;

    if (
      !links.some(
        (link) =>
          link.url && link.url.toLowerCase() === trimmedValue.toLowerCase()
      )
    ) {
      const newLink = {
        id: `new_${Date.now()}`,
        url: trimmedValue,
      };
      setLinks([...links, newLink]);
    }
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const removeLink = (linkToRemove) => {
    setLinks(links.filter((link) => link.id !== linkToRemove.id));
  };

  return (
    <div className="custom-link-container" ref={containerRef}>
      <div className="link-main-box">
        <div className="tags-container">
          {links.map((link) => (
            <div key={link.id} className="link-tag">
              <span className="link-icon">🔗</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-text"
              >
                {link.url}
              </a>
              <button
                type="button"
                className="remove-tag-button"
                onClick={() => removeLink(link)}
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
            placeholder={t("new-work.searchLink")}
          />
          {isLoading && (
            <div className="loading-indicator">{t("new-work.loading")}...</div>
          )}
        </div>

        <div className="add-link-button-container">
          <button
            type="button"
            className="add-link-button"
            onClick={addNewLink}
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
              onClick={() => addLinkFromSuggestion(suggestion)}
            >
              {suggestion.url}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LinkInput;
