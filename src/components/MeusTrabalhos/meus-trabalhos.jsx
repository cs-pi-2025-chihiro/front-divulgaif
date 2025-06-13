import React, { useState, useEffect } from 'react';
import { Filter, Plus, ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import './MeusTrabalhos.css';

const MeusTrabalhos = () => {
  const [filtroTrabalhos, setFiltroTrabalhos] = useState('');
  const [showTrabalhosFilter, setShowTrabalhosFilter] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const trabalhosPorPagina = 6;
  const usuarioLogado = {
    id: 1,
    nome: "Pedro",
    email: "pedro@estudante.ifpr.edu.br"
  };

  const todosTrabalhos = [
    {
      id: 1,
      titulo: "Desenvolvimento de Sistema Web para Gestão Acadêmica",
      descricao: "Projeto focado no desenvolvimento de uma aplicação web moderna utilizando React e Node.js para gestão de dados acadêmicos, com foco em usabilidade e performance.",
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Maria Santos", email: "maria@estudante.ifpr.edu.br" }
      ],
      data: "14 Jan, 2024",
      categoria: "Artigo",
      status: "Aprovado",
      tags: ["Desenvolvimento de Software", "React", "Node.js"],
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 2,
      titulo: "Análise de Algoritmos de Machine Learning Aplicados à Educação",
      descricao: "Estudo comparativo entre diferentes algoritmos de aprendizado de máquina aplicados à análise de dados educacionais para predição de desempenho acadêmico.",
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Ana Costa", email: "ana@estudante.ifpr.edu.br" }
      ],
      data: "28 Fev, 2024",
      categoria: "TCC",
      status: "Enviado",
      tags: ["Machine Learning", "Análise de Dados", "Python"],
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 3,
      titulo: "Internet das Coisas na Educação: Monitoramento Inteligente",
      descricao: "Implementação de soluções IoT para monitoramento e automação de ambientes educacionais, criando salas de aula inteligentes e interativas.",
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" }
      ],
      data: "15 Mar, 2024",
      categoria: "Projeto",
      status: "Rascunho",
      tags: ["IoT", "Arduino", "Sensores"],
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 4,
      titulo: "Aplicativo Mobile para Controle de Frequência",
      descricao: "Desenvolvimento de aplicativo móvel para controle automatizado de frequência estudantil utilizando tecnologias de reconhecimento facial.",
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" },
        { nome: "Carlos Lima", email: "carlos@estudante.ifpr.edu.br" }
      ],
      data: "10 Abr, 2024",
      categoria: "Artigo",
      status: "Rejeitado",
      tags: ["Mobile", "React Native", "IA"],
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 5,
      titulo: "Sistema de Blockchain para Certificação Acadêmica",
      descricao: "Proposta de sistema descentralizado usando blockchain para emissão e validação de certificados acadêmicos, garantindo autenticidade e segurança.",
      autores: [
        { nome: "Pedro Silva", email: "pedro@estudante.ifpr.edu.br" }
      ],
      data: "25 Mai, 2024",
      categoria: "Dissertação",
      status: "Aprovado",
      tags: ["Blockchain", "Certificação", "Segurança"],
      imagem: "/api/placeholder/300/200"
    },
    {
      id: 6,
      titulo: "Trabalho de Outro Usuário",
      descricao: "Este trabalho não deve aparecer na listagem do Pedro.",
      autores: [
        { nome: "João Outros", email: "joao@estudante.ifpr.edu.br" }
      ],
      data: "01 Jun, 2024",
      categoria: "Artigo",
      status: "Aprovado",
      tags: ["Teste"],
      imagem: "/api/placeholder/300/200"
    }
  ];

  const trabalhos = todosTrabalhos.filter(trabalho => 
    trabalho.autores.some(autor => autor.email === usuarioLogado.email)
  );

  const statusOptions = ['Rascunho', 'Enviado', 'Rejeitado', 'Aprovado'];
  const categoriaOptions = ['Artigo', 'TCC', 'Projeto', 'Dissertação', 'Tese'];
  
  const todasOpcoesFiltro = [
    { tipo: 'categoria', label: 'Categoria', opcoes: categoriaOptions },
    { tipo: 'status', label: 'Status', opcoes: statusOptions }
  ];

  const trabalhosFiltrados = trabalhos.filter(trabalho => {
    if (!filtroTrabalhos) return true;
    
    if (statusOptions.includes(filtroTrabalhos)) {
      return trabalho.status === filtroTrabalhos;
    }
    
    if (categoriaOptions.includes(filtroTrabalhos)) {
      return trabalho.categoria === filtroTrabalhos;
    }
    
    return trabalho.titulo.toLowerCase().includes(filtroTrabalhos.toLowerCase()) ||
           trabalho.tags.some(tag => tag.toLowerCase().includes(filtroTrabalhos.toLowerCase()));
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
    alert('Redirecionando para criação de novo trabalho...');
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
    if (!filtroTrabalhos) return 'Filtrar Trabalhos';
    return filtroTrabalhos;
  };

  return (
    <div className="container">
      {/* Main Content */}
      <main className="main-content">
        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-wrapper">
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
                    Todos os Trabalhos
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
                          {opcao}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleNovoTrabalho}
            className="new-work-button"
          >
            <Plus className="icon" />
            Novo Trabalho
          </button>
        </div>

        {/* Results and Pagination */}
        <div className="results-pagination">
          <h2 className="results-title">
            {trabalhosFiltrados.length} Resultado{trabalhosFiltrados.length !== 1 ? 's' : ''}
          </h2>
          
          {totalPaginas > 1 && (
            <div className="pagination-controls">
              <span className="pagination-info">
                Página {paginaAtual} de {totalPaginas}
              </span>
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
          )}
        </div>

        {/* Trabalhos Grid */}
        {trabalhosPaginaAtual.length > 0 ? (
          <div className="trabalhos-grid">
            {trabalhosPaginaAtual.map((trabalho) => (
              <div key={trabalho.id} className="trabalho-card">
                <div className="card-content">
                  <div className="image-placeholder">
                    <span className="image-text">Imagem</span>
                  </div>

                  <div className="status-container">
                    <span className={`status-badge ${getStatusColor(trabalho.status)}`}>
                      {trabalho.status}
                    </span>
                  </div>
                  
                  <h3 className="trabalho-title">
                    {trabalho.titulo}
                  </h3>
                  
                  <p className="trabalho-description">
                    {trabalho.descricao}
                  </p>

                  <div className="trabalho-meta">
                    <div><strong>Autores:</strong> {trabalho.autores.map(a => a.nome).join(', ')}</div>
                    <div><strong>Data:</strong> {trabalho.data}</div>
                  </div>

                  <div className="tags-container">
                    <span className="categoria-tag">
                      {trabalho.categoria}
                    </span>
                    {trabalho.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                    {trabalho.tags.length > 2 && (
                      <span className="tag">
                        +{trabalho.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Search className="search-icon" />
            </div>
            <h3 className="empty-title">Nenhum trabalho encontrado</h3>
            <p className="empty-description">
              {filtroTrabalhos 
                ? 'Tente ajustar os filtros para encontrar seus trabalhos ou remova todos os filtros.' 
                : 'Você ainda não possui trabalhos cadastrados. Comece criando seu primeiro trabalho!'}
            </p>
            <button
              onClick={handleNovoTrabalho}
              className="empty-action-button"
            >
              <Plus className="icon" />
              {filtroTrabalhos ? 'Criar Novo Trabalho' : 'Criar Primeiro Trabalho'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MeusTrabalhos;