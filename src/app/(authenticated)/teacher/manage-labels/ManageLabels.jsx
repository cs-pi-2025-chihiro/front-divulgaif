import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from "@uidotdev/usehooks";
import { Search, Edit, Trash2, Plus, ChevronLeft, ChevronRight, Tag, Filter, BarChart3 } from 'lucide-react';

import './ManageLabels.css';
import { searchLabels, createLabel, updateLabel, deleteLabel } from '../../../../services/labels/list'; 
import Button from '../../../../components/button';
import { SearchInput } from '../../../../components/input';
import LabelModal from '../../../../components/modal/label-modal/LabelModal';

const LABELS_QUERY_KEY = 'labels';
const DEFAULT_PAGE_SIZE = 20;

const ManageLabels = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLabel, setCurrentLabel] = useState(null); 
    const [modalMode, setModalMode] = useState('create');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: [LABELS_QUERY_KEY, currentPage, pageSize, debouncedSearchTerm],
        queryFn: () => searchLabels(debouncedSearchTerm, currentPage, pageSize),
        placeholderData: (previousData) => previousData, 
        staleTime: 5 * 60 * 1000, 
    });

    const labels = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalLabels = data?.totalElements ?? 0;
    const pageNumber = data?.number ?? 0;

    const createMutation = useMutation({
        mutationFn: createLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
            closeModal();
        },
        onError: (err) => {
            console.error("Failed to create label:", err);
            alert(t('labels.errors.createFailed', 'Failed to create label: ') + err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (labelData) => updateLabel(labelData.id, labelData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
            closeModal();
        },
        onError: (err) => {
            console.error("Failed to update label:", err);
            alert(t('labels.errors.updateFailed', 'Failed to update label: ') + err.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
        },
        onError: (err) => {
            console.error("Failed to delete label:", err);
            alert(t('labels.errors.deleteFailed', 'Failed to delete label: ') + err.message);
        },
    });

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(0);
    };

    const openCreateModal = () => {
        setCurrentLabel(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const openEditModal = (label) => {
        setCurrentLabel(label);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentLabel(null);
    };

    const handleSaveLabel = (labelData) => {
        if (modalMode === 'create') {
            createMutation.mutate(labelData);
        } else {
            updateMutation.mutate(labelData);
        }
    };

    const handleDeleteLabel = (labelId) => {
        if (window.confirm(t('labels.confirmDelete', 'Are you sure you want to delete this label?'))) {
            deleteMutation.mutate(labelId);
        }
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
    };

    return (
        <div className="manage-labels-container">
            <div className="labels-header">
                <h1><Tag size={28} /> {t('labels.title', 'Labels')}</h1>
                <Button onClick={openCreateModal} variant="primary" size="md">
                    <Plus size={18} /> {t('labels.addNew', 'Add New Label')}
                </Button>
            </div>

            <div className="labels-controls">
                <div className="search-wrapper">
                    <SearchInput
                        placeholder={t('labels.searchPlaceholder', 'Search labels...')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="labels-search-input"
                    />
                </div>
                <Button onClick={() => {}} variant="secondary" size="md">
                    <Filter size={18} /> {t('labels.filter', 'Filtrar Labels')}
                </Button>
            </div>

            <div className="labels-stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('labels.stats.quantity', 'Quantidade')}</div>
                        <div className="stat-value">{totalLabels}</div>
                    </div>
                </div>
            </div>

            {(isLoading || isFetching) && <p>{t('common.loading', 'Loading...')}</p>}
            {error && <p className="error-message">{t('labels.errors.loadFailed', 'Failed to load labels: ')}{error.message}</p>}

            {!isLoading && !error && (
                <>
                    <div className="labels-grid">
                        {labels.length > 0 ? (
                            labels.map((label) => (
                                <div key={label.id} className="label-card">
                                    <div className="label-card-content">
                                        <Tag size={20} className="label-icon" />
                                        <div>
                                            <div className="label-name">{label.name}</div>
                                            {label.workCount !== undefined && (
                                                <div className="label-count">({label.workCount})</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="label-card-actions">
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(label)} aria-label={t('common.edit')}>
                                            <Edit size={16} />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteLabel(label.id)} aria-label={t('common.delete')}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>{t('labels.noLabelsFound', 'No labels found.')}</p>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls-labels">
                            <span>
                                {t('pagination.page', 'Page')} {pageNumber + 1} {t('pagination.of', 'of')} {totalPages} ({totalLabels} {t('labels.total', 'labels')})
                            </span>
                            <div>
                                <Button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 0 || isLoading || isFetching}
                                    variant="secondary"
                                    size="sm"
                                    aria-label={t('pagination.previousPage')}
                                >
                                    <ChevronLeft size={18} />
                                </Button>
                                <Button
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages - 1 || isLoading || isFetching}
                                    variant="secondary"
                                    size="sm"
                                    aria-label={t('pagination.nextPage')}
                                >
                                    <ChevronRight size={18} />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <LabelModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveLabel}
                labelData={currentLabel}
                mode={modalMode}
            />
        </div>
    );
};

export default ManageLabels;