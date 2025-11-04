
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Student, Saving, SavingType } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { UserCircleIcon } from '../../components/Icons';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import FormButton from '../../components/FormButton';

type SavingInputs = {
    amount: number;
    type: SavingType;
    notes?: string;
};

const StudentTransactions = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<SavingInputs>();
    
    const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
        queryKey: ['classStudents', user?.classManaged],
        queryFn: () => api.getStudentsByClass(user!.classManaged!),
        enabled: !!user?.classManaged,
    });
    
    // This query is for the details of the *selected* student
    const { data: selectedStudentDetails, isLoading: isLoadingSelectedStudent } = useQuery<Student>({
        queryKey: ['studentDetails', selectedStudent?.id],
        queryFn: () => api.getStudentById(selectedStudent!.id),
        enabled: !!selectedStudent,
    });

    const { data: transactions, isLoading: isLoadingTxs } = useQuery<Saving[]>({
        queryKey: ['studentSavings', selectedStudent?.id],
        queryFn: () => api.getSavingsByStudent(selectedStudent!.id),
        enabled: !!selectedStudent,
    });

    const savingMutation = useMutation({
        mutationFn: (data: SavingInputs) => api.createSaving({ ...data, studentId: selectedStudent!.id }),
        onSuccess: () => {
            // Invalidate queries to refetch data automatically
            queryClient.invalidateQueries({ queryKey: ['studentSavings', selectedStudent?.id] });
            queryClient.invalidateQueries({ queryKey: ['classStudents', user?.classManaged] }); 
            queryClient.invalidateQueries({ queryKey: ['studentDetails', selectedStudent?.id] });
            toast.success('Transaksi berhasil dicatat!');
            reset({ amount: 0, type: SavingType.DEPOSIT, notes: '' });
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

    const studentToDisplay = selectedStudentDetails || selectedStudent;

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
                                {isLoadingSelectedStudent && !selectedStudentDetails ? <div className="h-20 animate-pulse bg-slate-200 rounded-md"></div> : (
                                    <>
                                        <h2 className="text-2xl font-bold text-slate-800">{studentToDisplay?.name}</h2>
                                        <p className="text-slate-500">NIS: {studentToDisplay?.nis}</p>
                                        <p className="mt-4 text-3xl font-bold text-emerald-600">Saldo: Rp {studentToDisplay?.balance.toLocaleString('id-ID')}</p>
                                    </>
                                )}
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Tambah Transaksi</h3>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <FormInput 
                                        id="amount"
                                        label="Jumlah"
                                        type="number"
                                        {...register('amount', { required: 'Jumlah harus diisi', valueAsNumber: true, min: { value: 1, message: 'Jumlah minimal 1' } })}
                                        error={errors.amount?.message}
                                    />
                                    <FormSelect id="type" label="Jenis Transaksi" {...register('type')}>
                                        <option value={SavingType.DEPOSIT}>Setoran</option>
                                        <option value={SavingType.WITHDRAWAL}>Penarikan</option>
                                    </FormSelect>
                                    <FormInput id="notes" label="Catatan (Opsional)" {...register('notes')} />
                                    <FormButton type="submit" disabled={savingMutation.isPending}>
                                        {savingMutation.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
                                    </FormButton>
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
