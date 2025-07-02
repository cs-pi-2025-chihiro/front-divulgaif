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
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Enviado': return 'bg-blue-100 text-blue-800';
      case 'Rascunho': return 'bg-gray-100 text-gray-800';
      case 'Rejeitado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFiltroTexto = () => {
    if (!filtroTrabalhos) return t('filterWorks');

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language === 'pt' ? 'EN' : 'PT'}</span>
          </button>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="filter-dropdown relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTrabalhosFilter(!showTrabalhosFilter);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>{getFiltroTexto()}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTrabalhosFilter ? 'rotate-180' : ''}`} />
            </button>

            {showTrabalhosFilter && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setFiltroTrabalhos('');
                    setShowTrabalhosFilter(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 font-medium border-b border-gray-100"
                >
                  {t('allWorks')}
                </button>

                {todasOpcoesFiltro.map((grupo) => (
                  <div key={grupo.tipo}>
                    <div className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-50">
                      {grupo.label}
                    </div>
                    {grupo.opcoes.map((opcao) => (
                      <button
                        key={opcao}
                        onClick={() => {
                          setFiltroTrabalhos(opcao);
                          setShowTrabalhosFilter(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50"
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('newWork')}
          </button>
        </div>

        {/* Results and Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {trabalhosFiltrados.length} {trabalhosFiltrados.length === 1 ? t('results') : t('results_plural')}
          </h2>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {t('page')} {paginaAtual} {t('of')} {totalPaginas}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handlePaginaAnterior}
                  disabled={paginaAtual === 1}
                  className={`p-2 rounded ${paginaAtual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleProximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className={`p-2 rounded ${paginaAtual === totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Works Grid */}
        {trabalhosPaginaAtual.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trabalhosPaginaAtual.map((trabalho) => (
              <div key={trabalho.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">{t('imageText')}</span>
                  </div>

                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trabalho.status)}`}>
                      {t(`statusTypes.${trabalho.status}`)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {trabalho.titulo[language]}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {trabalho.descricao[language]}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div><strong>{t('authors')}:</strong> {trabalho.autores.map(a => a.nome).join(', ')}</div>
                    <div><strong>{t('date')}:</strong> {trabalho.data}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {t(`workTypes.${trabalho.categoria}`)}
                    </span>
                    {trabalho.tags[language].slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {trabalho.tags[language].length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{trabalho.tags[language].length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noWorksFound')}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filtroTrabalhos ? t('noWorksFoundDesc') : t('noWorksYet')}
            </p>
            <button
              onClick={handleNovoTrabalho}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {filtroTrabalhos ? t('createNewWork') : t('createFirstWork')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWorks;