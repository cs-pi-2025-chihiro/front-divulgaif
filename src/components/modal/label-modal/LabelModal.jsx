import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../modal';
import Input from '../../input/input';
import Button from '../../button/button';
import './LabelModal.css';

const LabelModal = ({ isOpen, onClose, onSave, labelData, mode = 'create' }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && labelData) {
                setName(labelData.name || '');
            } else {
                setName('');
            }
            setError('');
        }
    }, [isOpen, mode, labelData]);

    const handleSave = () => {
        if (!name.trim()) {
            setError(t('labels.modal.nameRequired', 'Label name cannot be empty.'));
            return;
        }
        setError('');
        const dataToSave = mode === 'edit' && labelData?.id 
            ? { id: labelData.id, name: name.trim() } 
            : { name: name.trim() };
        onSave(dataToSave);
    };

    const title = mode === 'edit' ? t('labels.modal.editTitle', 'Edit Label') : t('labels.modal.createTitle', 'Create New Label');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} width="small">
            <div className="label-modal-content">
                <label htmlFor="labelName">{t('labels.modal.nameLabel', 'Label Name')}:</label>
                <Input
                    id="labelName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('labels.modal.namePlaceholder', 'Enter label name')}
                    className={`label-modal-input ${error ? 'input-error' : ''}`}
                />
                {error && <p className="label-modal-error">{error}</p>}
            </div>
            <div className="modal-footer">
                <Button variant="secondary" onClick={onClose}>
                    {t('common.cancel', 'Cancel')}
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    {t('common.save', 'Save')}
                </Button>
            </div>
        </Modal>
    );
};

export default LabelModal;