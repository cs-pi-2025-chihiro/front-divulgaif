import React, { useState, useRef, useEffect } from "react";
import "./author-input.css";

const MultipleAutocompleteInput = ({
  authors,
  setAuthors,
  suggestions,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    email: "",
    type: "Aluno",
  });
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
        (s) =>
          s.name.toLowerCase().startsWith(value.toLowerCase()) && // Correção aplicada aqui
          !authors.some((a) => a.id === s.id)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const addAuthorFromSuggestion = (author) => {
    setAuthors([...authors, author]);
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const removeAuthor = (authorToRemove) => {
    setAuthors(authors.filter((author) => author.id !== authorToRemove.id));
  };

  const handleNewAuthorChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor({ ...newAuthor, [name]: value });
  };

  const addNewAuthorManually = () => {
    if (newAuthor.name && newAuthor.email) {
      const newAuthorData = { ...newAuthor, id: `new_${Date.now()}` };
      setAuthors([...authors, newAuthorData]);
      setNewAuthor({ name: "", email: "", type: "Aluno" });
    }
  };

  return (
    <div className="custom-autocomplete-container" ref={containerRef}>
      <div className="autocomplete-main-box">
        <div className="tags-container">
          {authors.map((author) => (
            <div key={author.id} className="author-tag">
              <span className="author-icon">👤</span>
              {author.name}
              <button
                type="button"
                className="remove-tag-button"
                onClick={() => removeAuthor(author)}
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
            placeholder="Buscar autor..."
          />
        </div>
      </div>

      {filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((s) => (
            <li key={s.id} onClick={() => addAuthorFromSuggestion(s)}>
              {s.name}
            </li>
          ))}
        </ul>
      )}

      <div className="new-author-form-layout">
            <div className="form-top-row">
                <div className="field-wrapper">
                    <label>Nome Completo</label>
                    <input type="text" name="name" value={newAuthor.name} onChange={handleNewAuthorChange} />
                </div>
                <div className="field-wrapper">
                    <label>Email</label>
                    <input type="email" name="email" value={newAuthor.email} onChange={handleNewAuthorChange} />
                </div>
            </div>
            <div className="form-bottom-row">
                <div className="field-wrapper">
                    <label>Tipo</label>
                    <div className="type-buttons">
                        <button type="button" className={`type-button ${newAuthor.type === "Aluno" ? "active" : ""}`} onClick={() => setNewAuthor({ ...newAuthor, type: "Aluno" })}>
                            Aluno
                        </button>
                        <button type="button" className={`type-button ${newAuthor.type === "Professor" ? "active" : ""}`} onClick={() => setNewAuthor({ ...newAuthor, type: "Professor" })}>
                            Professor
                        </button>
                    </div>
                </div>
                <div className="add-button-wrapper">
                    <button type="button" className="add-button" onClick={addNewAuthorManually}>
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MultipleAutocompleteInput;