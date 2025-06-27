import React, { useState, useRef, useEffect } from "react";
import "./link-input.css";

const LinkInput = ({
  links,
  setLinks,
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
          suggestion.link.toLowerCase().startsWith(value.toLowerCase()) &&
          !links.some((link) => link.id === suggestion.id)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const addLinkFromSuggestion = (link) => {
    setLinks([...links, link]);
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
              <a href={link.link} target="_blank" rel="noopener noreferrer" className="link-text">
                {link.link}
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
            placeholder="Buscar links..."
          />
        </div>

        <div className="add-link-button-container">
          <button type="button" className="add-link-button">
            +
          </button>
        </div>
      </div>

      {filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion.id} onClick={() => addLinkFromSuggestion(suggestion)}>
              {suggestion.link}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LinkInput;