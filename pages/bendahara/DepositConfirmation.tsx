import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { api } from '../../services/api';
import { DailyDepositSlip } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ConfirmationIcon } from '../../components/Icons';

const DepositConfirmation: React.FC = () => {
    const queryClient = useQueryClient();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState<DailyDepositSlip | null>(null);

    const { data: slips, isLoading } = useQuery<DailyDepositSlip[]>({
        queryKey: ['pendingSlips'],
        queryFn: api.getPendingDepositSlips,
    });

    const mutation = useMutation({
        mutationFn: (slipId: string) => api.confirmDepositSlip(slipId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingSlips'] });
            closeConfirmModal();
            toast.success('Setoran berhasil dikonfirmasi!');
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal mengkonfirmasi setoran.');
        }
    });

    const handleConfirmClick = (slip: DailyDepositSlip) => {
        setSelectedSlip(slip);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedSlip(null);
    };

    const onConfirm = () => {
        if (selectedSlip) {
            mutation.mutate(selectedSlip.id);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Konfirmasi Setoran Guru</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                {isLoading ? <LoadingSpinner /> : !slips || slips.length === 0 ? (
                    <EmptyState message="Tidak ada setoran yang menunggu konfirmasi." icon={<ConfirmationIcon size={12}/>} />
                ) : (
                    <div className="space-y-4">
                        {slips.map(slip => (
                            <div key={slip.id} className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <p className="font-bold text-slate-800">Kelas: {slip.class}</p>
                                    <p className="text-sm text-slate-500">
                                        Tanggal: {new Date(slip.createdAt).toLocaleDateString('id-ID')}
                                    </p>
                                     <p className="text-lg font-semibold text-emerald-600 mt-2">
                                        Jumlah: Rp {slip.amount.toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleConfirmClick(slip)}
                                    disabled={mutation.isPending && selectedSlip?.id === slip.id}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-emerald-400"
                                >
                                    Konfirmasi
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={onConfirm}
                title="Konfirmasi Setoran"
                message={`Anda yakin ingin mengkonfirmasi setoran sebesar Rp ${selectedSlip?.amount.toLocaleString('id-ID')} dari kelas ${selectedSlip?.class}?`}
                confirmText="Ya, Konfirmasi"
                isConfirming={mutation.isPending}
                confirmVariant="success"
            />
        </div>
    );
};

export default DepositConfirmation;