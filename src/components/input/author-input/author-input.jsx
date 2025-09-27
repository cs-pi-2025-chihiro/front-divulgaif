import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./author-input.css";

const AuthorInput = ({ authors, setAuthors, getSuggestions }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newAuthor, setNewAuthor] = useState({
    name: "",
    email: "",
    type: null,
  });
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
          (s) => !authors.some((a) => a.id === s.id)
        );
        setFilteredSuggestions(filtered);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setFilteredSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setFilteredSuggestions([]);
    }
  };

  const addAuthorFromSuggestion = (author) => {
    if (!authors.some((a) => a.id === author.id)) {
      setAuthors([...authors, author]);
    }
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const removeAuthor = (indexToRemove) => {
    setAuthors(authors.filter((_, index) => index !== indexToRemove));
  };

  const handleNewAuthorChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor({ ...newAuthor, [name]: value });
  };

  const addNewAuthorManually = () => {
    if (newAuthor.name.trim() && newAuthor.email.trim() && newAuthor.type) {
      if (
        authors.some(
          (a) =>
            a.email &&
            a.email.toLowerCase() === newAuthor.email.trim().toLowerCase()
        )
      ) {
        alert(
          t("errors.duplicateAuthorEmail") ||
            "An author with this email already exists."
        );
        return;
      }

      setAuthors([
        ...authors,
        {
          name: newAuthor.name.trim(),
          email: newAuthor.email.trim(),
          type: newAuthor.type,
        },
      ]);

      setNewAuthor({ name: "", email: "", type: null });
    } else {
      if (!newAuthor.type) {
        alert(
          t("errors.authorTypeRequired") ||
            "Please select a type (student or teacher) for the new author."
        );
      } else {
        alert(
          t("errors.authorNameEmailRequired") ||
            "Please provide both name and email for the new author."
        );
      }
    }
  };

  return (
    <div className="custom-autocomplete-container" ref={containerRef}>
      <div className="autocomplete-main-box">
        <div className="tags-container">
          {authors.map((author, index) => (
            <div key={author.id || author.email} className="author-tag">
              {author.name}
              <button
                type="button"
                className="remove-tag-button"
                onClick={() => removeAuthor(index)}
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
            placeholder={t("new-work.searchAuthor")}
          />
          {isLoading && (
            <div className="loading-indicator">{t("new-work.loading")}...</div>
          )}
        </div>
      </div>

      {filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((s) => (
            <li key={s.id} onClick={() => addAuthorFromSuggestion(s)}>
              {s.name} ({s.email})
            </li>
          ))}
        </ul>
      )}

      <div className="new-author-form-layout">
        <div className="form-top-row">
          <div className="field-wrapper">
            <label>{t("new-work.fullName")}</label>
            <input
              type="text"
              name="name"
              value={newAuthor.name}
              onChange={handleNewAuthorChange}
            />
          </div>
          <div className="field-wrapper">
            <label>{t("new-work.email")}</label>
            <input
              type="email"
              name="email"
              value={newAuthor.email}
              onChange={handleNewAuthorChange}
            />
          </div>
        </div>
        <div className="form-bottom-row">
          <div className="field-wrapper">
            <label>{t("new-work.type")}</label>
            <div className="type-buttons">
              <button
                type="button"
                className={`type-button ${
                  newAuthor.type === "student" ? "active" : ""
                }`}
                onClick={() => setNewAuthor({ ...newAuthor, type: "student" })}
              >
                {t("new-work.student")}
              </button>
              <button
                type="button"
                className={`type-button ${
                  newAuthor.type === "teacher" ? "active" : ""
                }`}
                onClick={() => setNewAuthor({ ...newAuthor, type: "teacher" })}
              >
                {t("new-work.teacher")}
              </button>
            </div>
          </div>
          <div className="add-button-wrapper">
            <button
              type="button"
              className="add-button"
              onClick={addNewAuthorManually}
            >
              {t("new-work.add")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorInput;
