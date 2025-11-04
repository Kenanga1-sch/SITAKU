
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Student, Saving, SavingType } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { DepositIcon, TransactionIcon, UserCircleIcon } from '../../components/Icons';

type SavingInputs = {
    amount: number;
    type: SavingType;
    notes?: string;
};

const StudentTransactions: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<SavingInputs>();
    
    const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
        queryKey: ['classStudents', user?.classManaged],
        queryFn: () => api.getStudentsByClass(user!.classManaged!),
        enabled: !!user?.classManaged,
    });

    const { data: transactions, isLoading: isLoadingTxs } = useQuery<Saving[]>({
        queryKey: ['studentSavings', selectedStudent?.id],
        queryFn: () => api.getSavingsByStudent(selectedStudent!.id),
        enabled: !!selectedStudent,
    });

    const savingMutation = useMutation({
        mutationFn: (data: SavingInputs) => api.createSaving({ ...data, studentId: selectedStudent!.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentSavings', selectedStudent?.id] });
            queryClient.invalidateQueries({ queryKey: ['classStudents', user?.classManaged] }); // To update balance
            toast.success('Transaksi berhasil dicatat!');
            reset({ amount: 0, type: SavingType.DEPOSIT, notes: '' });
            // Refetch selected student to update balance display
            if(selectedStudent) {
                api.getStudentById(selectedStudent.id).then(updatedStudent => setSelectedStudent(updatedStudent));
            }
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal mencatat transaksi.');
        }
    });

    const onSubmit = (data: SavingInputs) => {
        savingMutation.mutate(data);
    };

    if (!user?.classManaged) {
        return <EmptyState message="Anda tidak ditugaskan sebagai wali kelas." icon={<UserCircleIcon size={12}/>} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Transaksi Siswa Kelas {user.classManaged}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Daftar Siswa</h2>
                    {isLoadingStudents ? <LoadingSpinner /> : (
                        <ul className="space-y-2 max-h-96 overflow-y-auto">
                            {students?.map(student => (
                                <li key={student.id}>
                                    <button 
                                        onClick={() => setSelectedStudent(student)}
                                        className={`w-full text-left p-3 rounded-md transition-colors ${selectedStudent?.id === student.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}
                                    >
                                        <p className="font-semibold">{student.name}</p>
                                        <p className="text-sm opacity-80">Saldo: Rp {student.balance.toLocaleString('id-ID')}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {!selectedStudent ? (
                        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex items-center justify-center">
                            <EmptyState message="Pilih siswa untuk melihat detail dan menambah transaksi." />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.name}</h2>
                                <p className="text-slate-500">NIS: {selectedStudent.nis}</p>
                                <p className="mt-4 text-3xl font-bold text-emerald-600">Saldo: Rp {selectedStudent.balance.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Tambah Transaksi</h3>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Jumlah</label>
                                        <input 
                                            type="number" 
                                            {...register('amount', { required: true, valueAsNumber: true, min: 1 })}
                                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                                        />
                                        {errors.amount && <p className="text-rose-600 text-sm mt-1">Jumlah harus diisi.</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Jenis Transaksi</label>
                                        <select {...register('type')} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm">
                                            <option value={SavingType.DEPOSIT}>Setoran</option>
                                            <option value={SavingType.WITHDRAWAL}>Penarikan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Catatan (Opsional)</label>
                                        <input type="text" {...register('notes')} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                                    </div>
                                    <button type="submit" disabled={savingMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                                        {savingMutation.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
                                    </button>
                                </form>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Riwayat Transaksi</h3>
                                {isLoadingTxs ? <LoadingSpinner /> : (
                                    <ul className="divide-y divide-slate-200 max-h-72 overflow-y-auto">
                                        {transactions?.length === 0 ? <EmptyState message="Belum ada transaksi."/> : transactions?.map(tx => (
                                            <li key={tx.id} className="py-3 flex justify-between items-center">
                                                <div>
                                                    <p className={`font-semibold ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {tx.type === SavingType.DEPOSIT ? 'Setoran' : 'Penarikan'}
                                                    </p>
                                                    <p className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleString('id-ID')}</p>
                                                </div>
                                                <p className={`font-bold ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                   {tx.type === SavingType.DEPOSIT ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentTransactions;
