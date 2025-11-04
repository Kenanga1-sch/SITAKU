
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Student, SavingType, Saving, StudentDebt } from '../../types';

import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import FormSelect from '../../components/FormSelect';
import { UserGroupIcon, WalletIcon, DebtIcon, DepositIcon, TransactionIcon } from '../../components/Icons';

type TransactionInputs = {
    amount: number;
    type: SavingType;
    notes?: string;
};

const StudentTransactions = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionInputs>();

    const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
        queryKey: ['classStudents', user?.classManaged],
        queryFn: () => user?.classManaged ? api.getStudentsByClass(user.classManaged) : [],
        enabled: !!user?.classManaged,
    });

    const { data: studentHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['studentTransactionHistory', selectedStudent?.id],
        queryFn: () => api.getStudentTransactionHistory(selectedStudent!.id),
        enabled: !!selectedStudent,
    });

    const transactionMutation = useMutation({
        mutationFn: (data: TransactionInputs & { studentId: string }) => api.createSaving(data),
        onSuccess: (updatedStudent) => {
            queryClient.invalidateQueries({ queryKey: ['classStudents', user?.classManaged] });
            queryClient.invalidateQueries({ queryKey: ['dailySummary'] }); 
            queryClient.invalidateQueries({ queryKey: ['studentTransactionHistory', selectedStudent?.id] });
            toast.success('Transaksi berhasil dicatat!');
            // Update selected student data locally for instant UI feedback
            if(selectedStudent) {
                setSelectedStudent(updatedStudent);
            }
            reset({ amount: 0, type: SavingType.DEPOSIT, notes: '' });
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal mencatat transaksi.');
        }
    });

    const filteredStudents = useMemo(() => {
        if (!students) return [];
        return students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nis.includes(searchTerm)
        );
    }, [students, searchTerm]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        reset({
            type: SavingType.DEPOSIT,
            amount: 0,
            notes: ''
        });
    };

    const onSubmit = (data: TransactionInputs) => {
        if (selectedStudent) {
            transactionMutation.mutate({ ...data, studentId: selectedStudent.id });
        }
    };
    
    const transactionType = watch('type');

    if (!user?.classManaged) {
        return <EmptyState message="Anda tidak ditugaskan sebagai wali kelas manapun." icon={<UserGroupIcon size={12}/>} />
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-2">
                <h1 className="text-3xl font-bold text-slate-800">Transaksi Siswa</h1>
                <p className="text-slate-600 sm:text-lg font-semibold">Kelas: {user.classManaged}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student List */}
                <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm h-[75vh] flex flex-col">
                    <FormInput 
                        id="search"
                        label=""
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari Siswa (Nama atau NIS)..."
                    />
                    <div className="flex-grow overflow-y-auto mt-4 pr-2 -mr-2">
                        {isLoadingStudents ? <LoadingSpinner /> : (
                            <ul className="space-y-2">
                                {filteredStudents.map(student => (
                                    <li key={student.id}>
                                        <button 
                                            onClick={() => handleSelectStudent(student)}
                                            className={`w-full text-left p-3 rounded-md transition-colors border-2 ${selectedStudent?.id === student.id ? 'bg-indigo-100 border-indigo-500' : 'hover:bg-slate-100 border-transparent'}`}
                                        >
                                            <p className="font-semibold text-slate-800">{student.name}</p>
                                            <p className="text-sm text-slate-500">NIS: {student.nis}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                         {filteredStudents.length === 0 && !isLoadingStudents && <EmptyState message="Siswa tidak ditemukan." />}
                    </div>
                </div>

                {/* Transaction Panel */}
                <div className="lg:col-span-2">
                    {selectedStudent ? (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">{selectedStudent.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-emerald-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-emerald-700">Saldo Saat Ini</p>
                                    <p className="text-2xl font-bold text-emerald-800">Rp {selectedStudent.balance.toLocaleString('id-ID')}</p>
                                </div>
                                 <div className="bg-rose-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-rose-700">Total Utang</p>
                                    <p className="text-2xl font-bold text-rose-800">Rp {selectedStudent.totalDebt.toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            {/* Transaction Form */}
                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">Catat Transaksi Baru</h3>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                     <FormSelect
                                        id="type"
                                        label="Jenis Transaksi"
                                        {...register('type', { required: true })}
                                    >
                                        <option value={SavingType.DEPOSIT}>Setor Tabungan</option>
                                        <option value={SavingType.WITHDRAWAL}>Tarik Tabungan</option>
                                    </FormSelect>
                                    <FormInput
                                        id="amount"
                                        label="Jumlah"
                                        type="number"
                                        {...register('amount', { required: 'Jumlah tidak boleh kosong', valueAsNumber: true, min: {value: 1, message: 'Jumlah minimal 1'} })}
                                        error={errors.amount?.message}
                                    />
                                    <FormInput
                                        id="notes"
                                        label={`Catatan (${transactionType === SavingType.DEPOSIT ? 'Penyetor' : 'Keperluan'}) - Opsional`}
                                        {...register('notes')}
                                    />
                                    <div className="flex justify-end">
                                        <FormButton type="submit" disabled={transactionMutation.isPending}>{transactionMutation.isPending ? 'Memproses...' : 'Simpan Transaksi'}</FormButton>
                                    </div>
                                </form>
                            </div>

                            {/* Transaction History */}
                            <div className="border-t border-slate-200 pt-6 mt-6">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">Riwayat Transaksi Terakhir</h3>
                                <div className="max-h-60 overflow-y-auto pr-2 -mr-2">
                                    {isLoadingHistory ? <LoadingSpinner /> : !studentHistory || studentHistory.length === 0 ? <EmptyState message="Belum ada transaksi." /> : (
                                        <ul className="divide-y divide-slate-200">
                                            {studentHistory.map(tx => (
                                                <li key={tx.id} className="py-3 flex justify-between items-center">
                                                    <div>
                                                        <p className={`font-semibold flex items-center gap-2 ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {tx.type === SavingType.DEPOSIT ? <DepositIcon /> : <TransactionIcon />}
                                                            {tx.notes || (tx.type === SavingType.DEPOSIT ? 'Setoran' : 'Penarikan')}
                                                        </p>
                                                        <p className="text-sm text-slate-500 pl-8">{new Date(tx.createdAt).toLocaleString('id-ID')}</p>
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
                        </div>
                    ) : (
                        <div className="flex items-center justify-center bg-white p-6 rounded-lg shadow-sm h-[75vh]">
                            <EmptyState message="Pilih siswa dari daftar di sebelah kiri untuk memulai transaksi." icon={<UserGroupIcon size={12}/>} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentTransactions;
