import React, { useEffect, useState } from 'react';
import Button from '../button';
import WorkCard from '../card/work-card';
import './paginated-results.css'; 

const PaginatedResults = ({ works, isLoading = false }) => {
    const [currentPage, setCurrentPage] = useState(0);

    const firstPageSize = 8;

    const totalPages = works.length <= firstPageSize ? 1 : 2;

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

    const LoadingCard = () => (
        <div className="loading-card">
            <div className="loading-image"></div>
            <div className="loading-content">
                <div className="loading-title"></div>
                <div className="loading-authors"></div>
                <div className="loading-description"></div>
                <div className="loading-description"></div>
            </div>
        </div>
    );

    return (
        <div className="ifexplore-results">
            <div className="results-header">
                <h2 className="results-title" aria-label={`${works.length} resultados encontrados`}>
                    {works.length} Resultados
                </h2>
                <div className="pagination-controls">
                    <Button
                        variant="outline"
                        size="sm"
                        typeFormat="rounded"
                        className="pagination-button prev"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 0}
                        aria-label="Ir para página anterior"
                    >
                        &lt;
                    </Button>
                    <span className="pagination-info" aria-label={`Página ${currentPage + 1} de ${totalPages}`}>
                        Página {currentPage + 1} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        typeFormat="rounded"
                        className="pagination-button next"
                        onClick={goToNextPage}
                        disabled={currentPage === 1 || works.length <= firstPageSize}
                        aria-label="Ir para próxima página"
                    >
                        &gt;
                    </Button>
                </div>
            </div>
            <div className="work-cards-container">
                {isLoading ? (
                    Array.from({ length: firstPageSize }).map((_, index) => (
                        <LoadingCard key={`loading-${index}`} />
                    ))
                ) : (
                    visibleWorks.map((work) => (
                        <WorkCard
                            key={work.id}
                            id={work.id}
                            title={work.title}
                            authors={work.authors}
                            description={work.description}
                            labels={work.labels}
                            date={work.date}
                            imageUrl={work.imageUrl}
                            onEdit={() => handleEdit(work.id)}
                            onView={() => handleView(work.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default PaginatedResults;