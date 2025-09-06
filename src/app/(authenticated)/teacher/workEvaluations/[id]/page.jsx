import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  Upload,
  X,
  Plus,
  Menu,
  User,
} from "lucide-react";
import "./page.css";

const WorkEvaluation = () => {
  const [currentUser] = useState({
    id: 1,
    name: "Pedro",
    role: "professor",
  });

  const [workData, setWorkData] = useState({
    id: 123,
    image: null,
    title: "Prevendo o Futuro: Algoritmo ML",
    workType: "Artigo",
    authors: [{ name: "Carlos", email: "", type: "Aluno" }],
    description:
      "Descrição meramente ilustrativa deve conter no máximo 160 palavras para aceitação.",
    abstract:
      "Resumo meramente ilustrativo deve conter no máximo 300 palavras para aceitação.",
    links: ["url1.com", "url2.com"],
    labels: ["Python", "MySQL"],
    status: "Em Avaliação",
    feedback:
      "Feedback de avaliação ilustrativo deve conter no máximo 160 palavras para aceitação.",
  });

  const [formData, setFormData] = useState({ ...workData });
  const [authorInput, setAuthorInput] = useState({
    name: "",
    email: "",
    type: "Aluno",
  });
  const [linkInput, setLinkInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);

  const [wordCounts, setWordCounts] = useState({
    description: 0,
    abstract: 0,
    feedback: 0,
  });

  useEffect(() => {
    setWordCounts({
      description: formData.description.trim()
        ? formData.description.trim().split(/\s+/).length
        : 0,
      abstract: formData.abstract.trim()
        ? formData.abstract.trim().split(/\s+/).length
        : 0,
      feedback: formData.feedback.trim()
        ? formData.feedback.trim().split(/\s+/).length
        : 0,
    });
  }, [formData.description, formData.abstract, formData.feedback]);

  // Manipuladores de eventos
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Upload de imagem
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange("image", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAuthor = () => {
    if (authorInput.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        authors: [
          ...prev.authors,
          { ...authorInput, name: authorInput.name.trim() },
        ],
      }));
      setAuthorInput({ name: "", email: "", type: "Aluno" });
    }
  };

  const removeAuthor = (index) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  };

  const addToList = (field, value, setter) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setter("");
    }
  };

  const removeFromList = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e, field, value, setter) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addToList(field, value, setter);
    }
  };

  // Funções para adicionar label
  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      addToList("labels", labelInput, setLabelInput);
      setShowAddLabel(false);
    }
  };

  // Funções para adicionar link
  const handleAddLink = () => {
    if (linkInput.trim() && !formData.links.includes(linkInput.trim())) {
      addToList("links", linkInput, setLinkInput);
      setShowAddLink(false);
    }
  };

  // Simulação de chamadas à API
  const simulateApiCall = async (action) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    return true;
  };

  const handleAccept = async () => {
    const success = await simulateApiCall("accept");
    if (success) {
      setFormData((prev) => ({ ...prev, status: "Aceito" }));
      setShowSuccessMessage("Trabalho aceito com sucesso!");
      setTimeout(() => setShowSuccessMessage(""), 5000);
    }
  };

  const handleReturn = async () => {
    const success = await simulateApiCall("return");
    if (success) {
      setFormData((prev) => ({ ...prev, status: "Devolvido" }));
      setShowSuccessMessage("Trabalho devolvido com sucesso!");
      setTimeout(() => setShowSuccessMessage(""), 5000);
    }
  };

  const canEvaluate =
    currentUser.role === "professor" && formData.status !== "Rascunho";

  return (
    <div className="app-container">
      <div className="main-content">
        {showSuccessMessage && (
          <div className="success-message">{showSuccessMessage}</div>
        )}

        <div className="form-container">
          <div className="image-section">
            <div className="image-placeholder">
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    alt="Trabalho"
                    className="uploaded-image"
                  />
                  {canEvaluate && (
                    <button
                      onClick={() => handleInputChange("image", null)}
                      className="image-remove-btn"
                    >
                      <X size={16} />
                    </button>
                  )}
                </>
              ) : (
                <div className="upload-prompt">
                  <div className="upload-icon-container">
                    <Upload className="upload-icon" />
                  </div>
                  <p className="upload-text">Adicionar imagem</p>
                  {canEvaluate && (
                    <label className="upload-file-btn">
                      Selecionar arquivo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tipo do Trabalho */}
          <div className="form-section">
            <label className="form-label">Tipo do Trabalho*</label>
            <div className="work-type-buttons">
              {["Artigo", "Pesquisa", "Dissertação", "Extensão", "TCC"].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange("workType", type)}
                    className={`work-type-btn ${
                      formData.workType === type ? "active" : ""
                    }`}
                    disabled={!canEvaluate}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Título */}
          <div className="form-section">
            <label className="form-label">Título do Trabalho*</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="form-input"
              disabled={!canEvaluate}
              placeholder="Prevendo o Futuro: Algoritmo ML"
              required
            />
          </div>

          {/* Autores */}
          <div className="form-section">
            <label className="form-label">Autores</label>
            <div className="authors-section">
              {formData.authors.map((author, index) => (
                <div key={index} className="author-card">
                  <div className="author-header">
                    <div className="author-info">
                      <User className="author-icon" />
                      <span className="author-name">{author.name}</span>
                      {canEvaluate && (
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="remove-btn"
                        >
                          <X className="remove-icon" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="author-details">
                    <div className="author-field">
                      <label className="field-label">Nome Completo</label>
                      <input
                        type="text"
                        value={author.name}
                        className="author-input"
                        disabled
                      />
                    </div>
                    <div className="author-field">
                      <label className="field-label">Email</label>
                      <input
                        type="email"
                        value={author.email}
                        className="author-input"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="author-type-section">
                    <label className="field-label">Tipo</label>
                    <div className="type-buttons">
                      {["Aluno", "Professor"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`type-btn ${
                            author.type === type ? "active" : ""
                          }`}
                          disabled
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {canEvaluate && (
                <div className="add-author-form">
                  <div className="author-inputs">
                    <div className="author-field">
                      <input
                        type="text"
                        value={authorInput.name}
                        onChange={(e) =>
                          setAuthorInput((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Nome Completo"
                        className="author-input"
                      />
                    </div>
                    <div className="author-field">
                      <input
                        type="email"
                        value={authorInput.email}
                        onChange={(e) =>
                          setAuthorInput((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Email"
                        className="author-input"
                      />
                    </div>
                  </div>
                  <div className="add-author-footer">
                    <div className="type-buttons">
                      {["Aluno", "Professor"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setAuthorInput((prev) => ({ ...prev, type }))
                          }
                          className={`type-btn ${
                            authorInput.type === type ? "active" : ""
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addAuthor}
                      className="add-btn"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              Descrição* ({wordCounts.description}/160 palavras)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`form-textarea ${!canEvaluate ? "disabled" : ""}`}
              disabled={!canEvaluate}
              placeholder="Descrição meramente ilustrativa deve conter no máximo 160 palavras para aceitação."
              required
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              Resumo* ({wordCounts.abstract}/300 palavras)
            </label>
            <textarea
              value={formData.abstract}
              onChange={(e) => handleInputChange("abstract", e.target.value)}
              rows={4}
              className={`form-textarea ${!canEvaluate ? "disabled" : ""}`}
              disabled={!canEvaluate}
              placeholder="Resumo meramente ilustrativo deve conter no máximo 300 palavras para aceitação."
              required
            />
          </div>

          {/* Labels */}
          <div className="form-section">
            <label className="form-label">Labels</label>
            <div className="labels-section">
              <div className="tags-container">
                {formData.labels.map((label, index) => (
                  <span key={index} className="tag">
                    {label}
                    {canEvaluate && (
                      <button
                        type="button"
                        onClick={() => removeFromList("labels", index)}
                        className="tag-remove"
                      >
                        <X className="tag-remove-icon" />
                      </button>
                    )}
                  </span>
                ))}
                {canEvaluate && (
                  <>
                    {!showAddLabel ? (
                      <button
                        type="button"
                        className="add-tag-btn"
                        onClick={() => setShowAddLabel(true)}
                      >
                        <Plus className="add-icon" />
                      </button>
                    ) : (
                      <div className="add-input-container">
                        <input
                          type="text"
                          value={labelInput}
                          onChange={(e) => setLabelInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddLabel()
                          }
                          placeholder="Nova label"
                          className="add-input"
                          autoFocus
                        />
                        <button
                          onClick={handleAddLabel}
                          className="confirm-btn"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setShowAddLabel(false);
                            setLabelInput("");
                          }}
                          className="cancel-btn"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="form-section">
            <label className="form-label">Links</label>
            <div className="links-section">
              {formData.links.map((link, index) => (
                <div key={index} className="link-item">
                  <span className="link-text">{link}</span>
                  {canEvaluate && (
                    <button
                      type="button"
                      onClick={() => removeFromList("links", index)}
                      className="link-remove"
                    >
                      <X className="link-remove-icon" />
                    </button>
                  )}
                </div>
              ))}
              {canEvaluate && (
                <>
                  {!showAddLink ? (
                    <button
                      type="button"
                      className="add-link-btn"
                      onClick={() => setShowAddLink(true)}
                    >
                      <Plus className="add-icon" />
                      Adicionar link
                    </button>
                  ) : (
                    <div className="add-link-container">
                      <input
                        type="text"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddLink()}
                        placeholder="https://exemplo.com"
                        className="add-link-input"
                        autoFocus
                      />
                      <button onClick={handleAddLink} className="confirm-btn">
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setShowAddLink(false);
                          setLinkInput("");
                        }}
                        className="cancel-btn"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="form-section">
            <label className="form-label">
              Feedback* ({wordCounts.feedback}/160 palavras)
            </label>
            <textarea
              value={formData.feedback}
              onChange={(e) => handleInputChange("feedback", e.target.value)}
              rows={4}
              className={`form-textarea ${!canEvaluate ? "disabled" : ""}`}
              disabled={!canEvaluate}
              placeholder="Feedback de avaliação ilustrativo deve conter no máximo 160 palavras para aceitação."
              required
            />
          </div>
        </div>

        {/* Footer com botões */}
        <div className="action-buttons">
          <button
            onClick={handleReturn}
            disabled={isLoading}
            className="btn btn-danger"
          >
            {isLoading && <div className="loading-spinner"></div>}
            Devolver
          </button>
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading && <div className="loading-spinner"></div>}
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkEvaluation;
