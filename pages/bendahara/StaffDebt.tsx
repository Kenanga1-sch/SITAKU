import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { TeacherDebt } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { AddIcon, DebtIcon, ConfirmationIcon } from '../../components/Icons';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';

type DebtInputs = Omit<TeacherDebt, 'id' | 'isPaid' | 'createdAt' | 'recordedById'>;

const StaffDebt = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<TeacherDebt | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<DebtInputs>();

    const { data: debts, isLoading } = useQuery<TeacherDebt[]>({
        queryKey: ['teacherDebts'],
        queryFn: api.getTeacherDebts,
    });

    const createMutation = useMutation({
        mutationFn: (data: DebtInputs) => api.createTeacherDebt(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacherDebts'] });
            closeModal();
            toast.success('Utang berhasil ditambahkan!');
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal menambahkan utang.');
        }
    });

    const payMutation = useMutation({
        mutationFn: (debtId: string) => api.payTeacherDebt(debtId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacherDebts'] });
            closePayConfirmModal();
            toast.success('Utang berhasil dilunasi!');
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal melunasi utang.');
        }
    });

    const openModal = () => {
        reset({ teacherName: '', amount: 0, notes: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handlePayClick = (debt: TeacherDebt) => {
        setSelectedDebt(debt);
        setIsPayConfirmOpen(true);
    };

    const closePayConfirmModal = () => {
        setSelectedDebt(null);
        setIsPayConfirmOpen(false);
    };
    
    const onConfirmPay = () => {
        if (selectedDebt) {
            payMutation.mutate(selectedDebt.id);
        }
    };

    const onSubmit = (data: DebtInputs) => {
        createMutation.mutate(data);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Utang Staff/Guru</h1>
                <FormButton onClick={openModal}>
                    <AddIcon />
                    <span>Catat Utang Baru</span>
                </FormButton>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                {isLoading ? <LoadingSpinner /> : !debts || debts.length === 0 ? (
                    <EmptyState message="Belum ada data utang staff." icon={<DebtIcon size={12}/>} />
                ) : (
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Catatan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {debts.map((debt) => (
                                    <tr key={debt.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{debt.teacherName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Rp {debt.amount.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{debt.notes}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(debt.createdAt).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {debt.isPaid ? 
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Lunas</span> : 
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">Belum Lunas</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!debt.isPaid && (
                                                <button onClick={() => handlePayClick(debt)} disabled={payMutation.isPending && selectedDebt?.id === debt.id} className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50" title="Tandai Lunas">
                                                    <ConfirmationIcon />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Catat Utang Baru">
                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                        id="teacherName"
                        label="Nama Staff/Guru"
                        {...register('teacherName', { required: 'Nama harus diisi' })}
                        error={errors.teacherName?.message}
                    />
                    <FormInput
                        id="amount"
                        label="Jumlah"
                        type="number"
                        {...register('amount', { required: 'Jumlah harus diisi', valueAsNumber: true, min: { value: 1, message: 'Jumlah minimal 1' } })}
                        error={errors.amount?.message}
                    />
                    <FormInput
                        id="notes"
                        label="Catatan (Opsional)"
                        {...register('notes')}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <FormButton type="button" variant="secondary" onClick={closeModal}>Batal</FormButton>
                        <FormButton type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Menyimmpan...' : 'Simpan'}</FormButton>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isPayConfirmOpen}
                onClose={closePayConfirmModal}
                onConfirm={onConfirmPay}
                title="Konfirmasi Pelunasan"
                message={`Anda yakin ingin menandai utang a.n. "${selectedDebt?.teacherName}" sebesar Rp ${selectedDebt?.amount.toLocaleString('id-ID')} sebagai LUNAS?`}
                confirmText="Ya, Lunasi"
                confirmVariant="success"
                isConfirming={payMutation.isPending}
            />
        </div>
    );
};

export default StaffDebt;