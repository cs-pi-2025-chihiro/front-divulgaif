import React, { useState } from 'react';
import Button from './Button'; 

const PaginatedResults = ({ works }) => {
    
    const [currentPage, setCurrentPage] = useState(0);

    
    const firstPageSize = 8;

    
    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(0);
        }
    };

    
    const goToNextPage = () => {
        if (currentPage === 0 && works.length > firstPageSize) {
            setCurrentPage(1);
        }
    };

    
    const visibleWorks = currentPage === 0
        ? works.slice(0, firstPageSize) 
        : works.slice(firstPageSize);   

    
    const handleEdit = (id) => {
        console.log(`Editando trabalho ${id}`);
        
    };

    const handleView = (id) => {
        console.log(`Visualizando trabalho ${id}`);
        
    };

    return (
        <div className="ifexplore-results">
            <div className="results-header">
                <h2 className="results-title">{works.length} Resultados</h2>
                <div className="pagination-controls">
                    <Button
                        variant="outline"
                        size="sm"
                        typeFormat="rounded"
                        className="pagination-button prev"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 0}
                        ariaLabel="Página anterior"
                    >
                        &lt;
                    </Button>
                    <span className="pagination-info">
                        Página {currentPage + 1} de {Math.ceil(works.length / firstPageSize) || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        typeFormat="rounded"
                        className="pagination-button next"
                        onClick={goToNextPage}
                        disabled={currentPage === 1 || works.length <= firstPageSize}
                        ariaLabel="Próxima página"
                    >
                        &gt;
                    </Button>
                </div>
            </div>
            <div className="work-cards-container">
                {visibleWorks.map((work) => (
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
    );
};

export default PaginatedResults;