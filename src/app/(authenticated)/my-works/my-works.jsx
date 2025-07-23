import React, { useState, useEffect } from 'react';
import { Filter, Plus, ChevronLeft, ChevronRight, Search, ChevronDown, Globe } from 'lucide-react';
import ptTranslations from '../../../locales/pt/translation.json';
import enTranslations from '../../../locales/en/translation.json';
import './my-works.css'

const useTranslation = (language) => {
  const translations = {
    pt: ptTranslations,
    en: enTranslations
  };

  const t = (key, options = {}) => {
    const keys = key.split('.');
    let translation = translations[language];

    for (const k of keys) {
      translation = translation?.[k];
    }

    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    if (typeof translation === 'string' && options) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return options[key] || match;
      });
    }

    return translation;
  };

  return { t };
};

const MyWorks = () => {
  const [filtroTrabalhos, setFiltroTrabalhos] = useState('');
  const [showTrabalhosFilter, setShowTrabalhosFilter] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [language, setLanguage] = useState('pt');
  const trabalhosPorPagina = 6;

  const { t } = useTranslation(language);

  const usuarioLogado = {
    id: 1,
    nome: "Pedro",
    email: "pedro@estudante.ifpr.edu.br"
  };

  const todosTrabalhos = [
    {
      id: 1,
      titulo: {
        pt: "Desenvolvimento de Sistema Web para Gestão Acadêmica",
        en: "Web System Development for Academic Management"
      },
      descricao: {
        pt: "Projeto focado no desenvolvimento de uma aplicação web moderna utilizando React e Node.js para gestão de dados acadêmicos, com foco em usabilidade e performance.",
        en: "Project focused on developing a modern web application using React and Node.js for academic data management, focusing on usability and performance."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Maria Santos", email: "maria@estudante.ifpr.edu.br" }
      ],
      data: "14 Jan, 2024",
      categoria: "Artigo",
      status: "Aprovado",
      tags: {
        pt: ["Desenvolvimento de Software", "React", "Node.js"],
        en: ["Software Development", "React", "Node.js"]
      },
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 2,
      titulo: {
        pt: "Análise de Algoritmos de Machine Learning Aplicados à Educação",
        en: "Analysis of Machine Learning Algorithms Applied to Education"
      },
      descricao: {
        pt: "Estudo comparativo entre diferentes algoritmos de aprendizado de máquina aplicados à análise de dados educacionais para predição de desempenho acadêmico.",
        en: "Comparative study between different machine learning algorithms applied to educational data analysis for academic performance prediction."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Ana Costa", email: "ana@estudante.ifpr.edu.br" }
      ],
      data: "28 Feb, 2024",
      categoria: "TCC",
      status: "Enviado",
      tags: {
        pt: ["Machine Learning", "Análise de Dados", "Python"],
        en: ["Machine Learning", "Data Analysis", "Python"]
      },
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 3,
      titulo: {
        pt: "Internet das Coisas na Educação: Monitoramento Inteligente",
        en: "Internet of Things in Education: Smart Monitoring"
      },
      descricao: {
        pt: "Implementação de soluções IoT para monitoramento e automação de ambientes educacionais, criando salas de aula inteligentes e interativas.",
        en: "Implementation of IoT solutions for monitoring and automation of educational environments, creating smart and interactive classrooms."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" }
      ],
      data: "15 Mar, 2024",
      categoria: "Projeto",
      status: "Rascunho",
      tags: {
        pt: ["IoT", "Arduino", "Sensores"],
        en: ["IoT", "Arduino", "Sensors"]
      },
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 4,
      titulo: {
        pt: "Aplicativo Mobile para Controle de Frequência",
        en: "Mobile App for Attendance Control"
      },
      descricao: {
        pt: "Desenvolvimento de aplicativo móvel para controle automatizado de frequência estudantil utilizando tecnologias de reconhecimento facial.",
        en: "Development of mobile application for automated student attendance control using facial recognition technologies."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Carlos Lima", email: "carlos@estudante.ifpr.edu.br" }
      ],
      data: "10 Apr, 2024",
      categoria: "Artigo",
      status: "Rejeitado",
      tags: {
        pt: ["Mobile", "React Native", "IA"],
        en: ["Mobile", "React Native", "AI"]
      },
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 5,
      titulo: {
        pt: "Sistema de Blockchain para Certificação Acadêmica",
        en: "Blockchain System for Academic Certification"
      },
      descricao: {
        pt: "Proposta de sistema descentralizado usando blockchain para emissão e validação de certificados acadêmicos, garantindo autenticidade e segurança.",
        en: "Proposal for a decentralized system using blockchain for issuing and validating academic certificates, ensuring authenticity and security."
      },
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" }
      ],
      data: "25 May, 2024",
      categoria: "Dissertação",
      status: "Aprovado",
      tags: {
        pt: ["Blockchain", "Certificação", "Segurança"],
        en: ["Blockchain", "Certification", "Security"]
      },
      imagem: "/api/placeholder/300/200"
    }
  ];

  const trabalhos = todosTrabalhos.filter(trabalho =>
    trabalho.autores.some(autor => autor.email === usuarioLogado.email)
  );

  const statusOptions = ['Rascunho', 'Enviado', 'Rejeitado', 'Aprovado'];
  const categoriaOptions = ['Artigo', 'TCC', 'Projeto', 'Dissertação', 'Tese'];

  const todasOpcoesFiltro = [
    { tipo: 'categoria', label: t('category'), opcoes: categoriaOptions },
    { tipo: 'status', label: t('status'), opcoes: statusOptions }
  ];

  const trabalhosFiltrados = trabalhos.filter(trabalho => {
    if (!filtroTrabalhos) return true;

    if (statusOptions.includes(filtroTrabalhos)) {
      return trabalho.status === filtroTrabalhos;
    }

    if (categoriaOptions.includes(filtroTrabalhos)) {
      return trabalho.categoria === filtroTrabalhos;
    }

    return trabalho.titulo[language].toLowerCase().includes(filtroTrabalhos.toLowerCase()) ||
      trabalho.tags[language].some(tag => tag.toLowerCase().includes(filtroTrabalhos.toLowerCase()));
  });

  const totalPaginas = Math.ceil(trabalhosFiltrados.length / trabalhosPorPagina);
  const indiceInicio = (paginaAtual - 1) * trabalhosPorPagina;
  const indiceFim = indiceInicio + trabalhosPorPagina;
  const trabalhosPaginaAtual = trabalhosFiltrados.slice(indiceInicio, indiceFim);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroTrabalhos]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setShowTrabalhosFilter(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNovoTrabalho = () => {
    alert(t('myWorks.redirectingToCreate'));
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado': return 'status-aprovado';
      case 'Enviado': return 'status-enviado';
      case 'Rascunho': return 'status-rascunho';
      case 'Rejeitado': return 'status-rejeitado';
      default: return 'status-default';
    }
  };

  const getFiltroTexto = () => {
    // Aqui é onde a mudança é feita.
    // Se não houver filtro, retorna a string 'Filtrar trabalhos'
    if (!filtroTrabalhos) return 'Filtrar trabalhos';

    if (statusOptions.includes(filtroTrabalhos)) {
      return t(`statusTypes.${filtroTrabalhos}`);
    }
    if (categoriaOptions.includes(filtroTrabalhos)) {
      return t(`workTypes.${filtroTrabalhos}`);
    }

    return filtroTrabalhos;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  return (
    <div className="container">
      <div className="main-content">
        {/* Header with Language Toggle */}
        <div className="filters-section" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="results-title">{t('Meus Trabalhos')}</h1>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTrabalhosFilter(!showTrabalhosFilter);
              }}
              className="filter-button"
            >
              <Filter className="icon" />
              <span>{getFiltroTexto()}</span>
              <ChevronDown className={`icon chevron ${showTrabalhosFilter ? 'rotated' : ''}`} />
            </button>

            {showTrabalhosFilter && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    setFiltroTrabalhos('');
                    setShowTrabalhosFilter(false);
                  }}
                  className="dropdown-item all-items"
                >
                  {t('allWorks')}
                </button>

                {todasOpcoesFiltro.map((grupo) => (
                  <div key={grupo.tipo}>
                    <div className="dropdown-group-header">
                      {grupo.label}
                    </div>
                    {grupo.opcoes.map((opcao) => (
                      <button
                        key={opcao}
                        onClick={() => {
                          setFiltroTrabalhos(opcao);
                          setShowTrabalhosFilter(false);
                        }}
                        className="dropdown-item"
                      >
                        {grupo.tipo === 'status' ? t(`statusTypes.${opcao}`) : t(`workTypes.${opcao}`)}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleNovoTrabalho}
            className="new-work-button"
          >
            <Plus className="icon" />
            {t('Novo Trabalho')}
          </button>
        </div>

        {/* Results and Pagination */}
        <div className="results-pagination">
          <h2 className="results-title">
            {trabalhosFiltrados.length} {trabalhosFiltrados.length === 1 ? t('results') : t('resultados')}
          </h2>

          {totalPaginas > 1 && (
            <div className="pagination-controls">
              <span className="pagination-info">
                {t('page')} {paginaAtual} {t('of')} {totalPaginas}
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={handlePaginaAnterior}
                  disabled={paginaAtual === 1}
                  className={`pagination-button ${paginaAtual === 1 ? 'disabled' : 'enabled'}`}
                >
                  <ChevronLeft className="icon" />
                </button>
                <button
                  onClick={handleProximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className={`pagination-button ${paginaAtual === totalPaginas ? 'disabled' : 'enabled'}`}
                >
                  <ChevronRight className="icon" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Works Grid */}
        {trabalhosPaginaAtual.length > 0 ? (
          <div className="trabalhos-grid">
            {trabalhosPaginaAtual.map((trabalho) => (
              <div key={trabalho.id} className="trabalho-card">
                <div className="card-content">
                  <div className="image-placeholder">
                    <span className="image-text">{t('imageText')}</span>
                  </div>

                  <div className="status-container">
                    <span className={`status-badge ${getStatusColor(trabalho.status)}`}>
                      {t(`statusTypes.${trabalho.status}`)}
                    </span>
                  </div>

                  <h3 className="trabalho-title">
                    {trabalho.titulo[language]}
                  </h3>

                  <p className="trabalho-description">
                    {trabalho.descricao[language]}
                  </p>

                  <div className="trabalho-meta">
                    <div><strong>{t('authors')}:</strong> {trabalho.autores.map(a => a.nome).join(', ')}</div>
                    <div><strong>{t('date')}:</strong> {trabalho.data}</div>
                  </div>

                  <div className="tags-container">
                    <span className="categoria-tag">
                      {t(`workTypes.${trabalho.categoria}`)}
                    </span>
                    {trabalho.tags[language].slice(0, 2).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                    {trabalho.tags[language].length > 2 && (
                      <span className="tag">
                        +{trabalho.tags[language].length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="image-placeholder empty-icon"> {/* Reusing image-placeholder for styling the icon background */}
              <Search className="search-icon" />
            </div>
            <h3 className="empty-title">{t('noWorksFound')}</h3>
            <p className="empty-description">
              {filtroTrabalhos ? t('noWorksFoundDesc') : t('noWorksYet')}
            </p>
            <button
              onClick={handleNovoTrabalho}
              className="empty-action-button"
            >
              <Plus className="icon" />
              {filtroTrabalhos ? t('createNewWork') : t('createFirstWork')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWorks;