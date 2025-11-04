
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Student, SavingType } from '../../types';

import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import FormSelect from '../../components/FormSelect';
import { UserGroupIcon, WalletIcon } from '../../components/Icons';

type TransactionInputs = {
    studentId: string;
    amount: number;
    type: SavingType;
    notes?: string;
};

const StudentTransactions = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionInputs>();

    const { data: students, isLoading } = useQuery<Student[]>({
        queryKey: ['classStudents', user?.classManaged],
        queryFn: () => user?.classManaged ? api.getStudentsByClass(user.classManaged) : [],
        enabled: !!user?.classManaged,
    });

    const transactionMutation = useMutation({
        mutationFn: (data: TransactionInputs) => api.createSaving(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classStudents', user?.classManaged] });
            queryClient.invalidateQueries({ queryKey: ['dailySummary'] }); // Invalidate summary for DailyDeposit page
            closeModal();
            toast.success('Transaksi berhasil dicatat!');
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

    const openModal = (student: Student) => {
        setSelectedStudent(student);
        reset({
            studentId: student.id,
            type: SavingType.DEPOSIT,
            amount: 0,
            notes: ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
    };

    const onSubmit = (data: TransactionInputs) => {
        transactionMutation.mutate(data);
    };
    
    const transactionType = watch('type');

    if (!user?.classManaged) {
        return <EmptyState message="Anda tidak ditugaskan sebagai wali kelas manapun." icon={<UserGroupIcon size={12}/>} />
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Transaksi Siswa</h1>
            <p className="text-slate-600 mb-6">Kelas: {user.classManaged}</p>
            
            <div className="mb-4">
                <FormInput 
                    id="search"
                    label="Cari Siswa (Nama atau NIS)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Masukkan nama atau NIS..."
                />
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                {isLoading ? <LoadingSpinner /> : !filteredStudents || filteredStudents.length === 0 ? (
                    <EmptyState message="Tidak ada data siswa di kelas ini." icon={<UserGroupIcon size={12}/>} />
                ) : (
                    <div className="space-y-4">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <p className="font-bold text-slate-800">{student.name}</p>
                                    <p className="text-sm text-slate-500">NIS: {student.nis}</p>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mt-2">
                                        <WalletIcon /> Saldo: Rp {student.balance.toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <FormButton onClick={() => openModal(student)}>
                                    Catat Transaksi
                                </FormButton>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} title={`Transaksi untuk ${selectedStudent?.name}`}>
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
                    <div className="flex justify-end gap-3 pt-2">
                        <FormButton type="button" variant="secondary" onClick={closeModal}>Batal</FormButton>
                        <FormButton type="submit" disabled={transactionMutation.isPending}>{transactionMutation.isPending ? 'Memproses...' : 'Simpan Transaksi'}</FormButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentTransactions;
