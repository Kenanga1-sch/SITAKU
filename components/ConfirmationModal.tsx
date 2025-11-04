import React from 'react';
import Modal from './Modal';
import FormButton from './FormButton';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isConfirming?: boolean;
    confirmVariant?: 'primary' | 'danger' | 'secondary' | 'success';
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isConfirming = false,
    confirmVariant = 'danger',
}: ConfirmationModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div>
                <p className="text-slate-600">{message}</p>
                <div className="flex justify-end gap-3 mt-6">
                    <FormButton
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        {cancelText}
                    </FormButton>
                    <FormButton
                        type="button"
                        onClick={onConfirm}
                        disabled={isConfirming}
                        variant={confirmVariant}
                    >
                        {isConfirming ? 'Memproses...' : confirmText}
                    </FormButton>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;