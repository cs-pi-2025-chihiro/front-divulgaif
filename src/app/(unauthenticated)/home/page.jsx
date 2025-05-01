import { SearchInput } from "../../../components/input";
import Button from "../../../components/button";
import "./page.css";
import mockedValues from "../../../data/mockedValues.json";
import WorkCard from "../../../components/card/workCard";

const works = mockedValues.trabalhos;

const Home = () => {
  return (
    <div className="ifexplore-container">
      <div className="ifexplore-search-container">
        <h1 className="ifexplore-title">IF Xplore</h1>
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <SearchInput className="search-input" placeholder="Pesquisar..." />
          </div>
        </div>
        <div className="filter-buttons-container">
          <Button variant="tertiary" size="md" className="filter-btn">
            Filtrar Busca
          </Button>
          <Button variant="tertiary" size="md" className="filter-btn">
            Filtrar Apresentação
          </Button>
        </div>
        <div className="new-work-container">
          <Button variant="tertiary" size="lg" className="new-work-btn">
            <span className="icon">📄</span> Novo Trabalho
          </Button>
        </div>
      </div>
      <div className="ifexplore-results">
        <div className="results-header">
          <h2 className="results-title">20 Resultados</h2>
          <div className="pagination-controls">
            <button className="pagination-button prev">&lt;</button>
            <button className="pagination-button next">&gt;</button>
          </div>
        </div>
        <div className="work-cards-container">
          {works.map((work) => (
            <WorkCard
              key={work.id}
              title={work.title}
              authors={work.authors}
              description={work.description}
              imageUrl={work.imageUrl}
              onEdit={() => handleEdit(work.id)}
              onView={() => handleView(work.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
