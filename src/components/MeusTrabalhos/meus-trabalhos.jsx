import React, { useState, useEffect } from 'react';
import { Filter, Plus, User, Menu, ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import './meus-trabalhos.css';

const MeusTrabalhos = () => {
  // Estados para filtros
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
    if (!filtroTrabalhos) return 'Filtrar';
    return `Filtros (${filtroTrabalhos})`;
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-flex">
            <div className="header-left">
              <Menu className="menu-icon" />
              <h1 className="header-title">DivulgaIF</h1>
            </div>
            <div className="user-info">
              <User className="user-icon" />
              <span className="user-name">{usuarioLogado.nome}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Título da Página */}
        <h1 className="page-title">Meus Trabalhos</h1>

        {/* Filtros e Ações */}
        <div className="actions-container">
          <div className="filters-container">
            {/* Filtro de Trabalhos */}
            <div className="filter-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTrabalhosFilter(!showTrabalhosFilter);
                }}
                className="filter-button"
              >
                <Filter className="filter-icon" />
                <span>{getFiltroTexto()}</span>
                <ChevronDown className={`chevron-icon ${showTrabalhosFilter ? 'rotated' : ''}`} />
              </button>
              
              {showTrabalhosFilter && (
                <div className="filter-dropdown-menu">
                  <button
                    onClick={() => {
                      setFiltroTrabalhos('');
                      setShowTrabalhosFilter(false);
                    }}
                    className="filter-option todos-trabalhos"
                  >
                    Todos os Trabalhos
                  </button>
                  
                  {todasOpcoesFiltro.map((grupo) => (
                    <div key={grupo.tipo}>
                      <div className="filter-group-header">
                        {grupo.label}
                      </div>
                      {grupo.opcoes.map((opcao) => (
                        <button
                          key={opcao}
                          onClick={() => {
                            setFiltroTrabalhos(opcao);
                            setShowTrabalhosFilter(false);
                          }}
                          className="filter-option"
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

          {/* Botão Novo Trabalho */}
          <button
            onClick={handleNovoTrabalho}
            className="novo-trabalho-button"
          >
            <Plus className="plus-icon" />
            Novo Trabalho
          </button>
        </div>

        {/* Contador de Resultados e Paginação */}
        <div className="results-pagination-container">
          <h2 className="results-count">
            {trabalhosFiltrados.length} Resultado{trabalhosFiltrados.length !== 1 ? 's' : ''}
          </h2>
          
          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <button
                onClick={handlePaginaAnterior}
                disabled={paginaAtual === 1}
                className={`pagination-button ${paginaAtual === 1 ? 'disabled' : ''}`}
              >
                <ChevronLeft className="pagination-icon" />
              </button>
              <button
                onClick={handleProximaPagina}
                disabled={paginaAtual === totalPaginas}
                className={`pagination-button ${paginaAtual === totalPaginas ? 'disabled' : ''}`}
              >
                <ChevronRight className="pagination-icon" />
              </button>
            </div>
          )}
        </div>

        {/* Grid de Trabalhos */}
        {trabalhosPaginaAtual.length > 0 ? (
          <div className="trabalhos-grid">
            {trabalhosPaginaAtual.map((trabalho) => (
              <div key={trabalho.id} className="trabalho-card">
                <div className="trabalho-content">
                  {/* Área da Imagem */}
                  <div className="trabalho-imagem">
                    <span className="imagem-placeholder">Imagem</span>
                  </div>

                  {/* Status Badge */}
                  <div className="status-container">
                    <span className={`status-badge ${getStatusColor(trabalho.status)}`}>
                      {trabalho.status}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="trabalho-titulo">
                    {trabalho.titulo}
                  </h3>
                  
                  {/* Descrição */}
                  <p className="trabalho-descricao">
                    {trabalho.descricao}
                  </p>

                  {/* Metadados */}
                  <div className="trabalho-metadados">
                    <div><strong>Autores:</strong> {trabalho.autores.map(a => a.nome).join(', ')}</div>
                    <div><strong>Data:</strong> {trabalho.data}</div>
                  </div>

                  {/* Tags */}
                  <div className="tags-container">
                    <span className="tag categoria-tag">
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
          // Estado Vazio
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
              <Plus className="plus-icon" />
              {filtroTrabalhos ? 'Criar Novo Trabalho' : 'Criar Primeiro Trabalho'}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-grid">
                  <div className="logo-square red"></div>
                  <div className="logo-square yellow"></div>
                  <div className="logo-square green"></div>
                  <div className="logo-square blue"></div>
                </div>
              </div>
              <div className="footer-institute">
                <div className="institute-line">INSTITUTO FEDERAL</div>
                <div className="institute-line">do Paraná</div>
                <div className="institute-line">Campus Paranavaí</div>
              </div>
              <div className="footer-title">DivulgaIF</div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-links">
              <span>SIGAA</span>
              <span className="separator">|</span>
              <span>Cronos</span>
              <span className="separator">|</span>
              <span>SUAP</span>
              <span className="separator">|</span>
              <span>Moodle</span>
            </div>
            <div className="footer-links">
              <span>Acessibilidade e Ajuda</span>
              <span className="separator">|</span>
              <span>Sobre o Projeto</span>
            </div>
            <div className="footer-copyright">
              © DivulgaIF | Todos os Direitos Reservados
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MeusTrabalhos;