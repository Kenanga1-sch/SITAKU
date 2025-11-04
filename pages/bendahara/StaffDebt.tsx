
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { TeacherDebt } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { AddIcon, DebtIcon, ConfirmationIcon } from '../../components/Icons';

type DebtInputs = Omit<TeacherDebt, 'id' | 'isPaid' | 'createdAt' | 'recordedById'>;

const StaffDebt: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const onSubmit = (data: DebtInputs) => {
        createMutation.mutate(data);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Utang Staff/Guru</h1>
                <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                    <AddIcon />
                    <span>Catat Utang Baru</span>
                </button>
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
                                    <tr key={debt.id}>
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
                                                <button onClick={() => payMutation.mutate(debt.id)} disabled={payMutation.isPending} className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50">
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
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nama Staff/Guru</label>
                        <input {...register('teacherName', { required: 'Nama harus diisi' })} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"/>
                        {errors.teacherName && <p className="text-rose-600 text-sm mt-1">{errors.teacherName.message}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Jumlah</label>
                        <input type="number" {...register('amount', { required: true, valueAsNumber: true, min: 1 })} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"/>
                        {errors.amount && <p className="text-rose-600 text-sm mt-1">Jumlah harus diisi.</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Catatan (Opsional)</label>
                        <input {...register('notes')} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"/>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-100 rounded-md">Batal</button>
                        <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400">{createMutation.isPending ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StaffDebt;
