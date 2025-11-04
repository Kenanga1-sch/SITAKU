import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { Student, Saving, StudentDebt, SavingType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import FormButton from '../../components/FormButton';
import { AddIcon, DepositIcon, TransactionIcon, WalletIcon, DebtIcon } from '../../components/Icons';

type SavingInputs = {
    amount: number;
    type: SavingType;
    notes?: string;
};

type DebtInputs = {
    amount: number;
    notes?: string;
};

const StudentTransactions = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
    const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
    const [debtToPay, setDebtToPay] = useState<StudentDebt | null>(null);

    const { register: registerSaving, handleSubmit: handleSubmitSaving, reset: resetSaving, formState: { errors: savingErrors } } = useForm<SavingInputs>();
    const { register: registerDebt, handleSubmit: handleSubmitDebt, reset: resetDebt, formState: { errors: debtErrors } } = useForm<DebtInputs>();

    const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
        queryKey: ['myStudents', user?.classManaged],
        queryFn: () => api.getStudentsByClass(user!.classManaged!),
        enabled: !!user?.classManaged,
    });

    const studentId = selectedStudent?.id;
    const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
        queryKey: ['studentTransactions', studentId],
        queryFn: () => api.getStudentTransactions(studentId!),
        enabled: !!studentId,
    });

    const savingMutation = useMutation({
        mutationFn: (data: SavingInputs) => api.createSaving(selectedStudent!.id, data),
        onSuccess: () => {
            toast.success('Transaksi berhasil disimpan!');
            queryClient.invalidateQueries({ queryKey: ['studentTransactions', studentId] });
            queryClient.invalidateQueries({ queryKey: ['dailySummary'] }); // Invalidate guru's daily summary
            closeSavingModal();
        },
        onError: (err) => toast.error((err as Error).message),
    });

    const debtMutation = useMutation({
        mutationFn: (data: DebtInputs) => api.createStudentDebt(selectedStudent!.id, data),
        onSuccess: () => {
            toast.success('Utang berhasil dicatat!');
            queryClient.invalidateQueries({ queryKey: ['studentTransactions', studentId] });
            closeDebtModal();
        },
        onError: (err) => toast.error((err as Error).message),
    });

    const payDebtMutation = useMutation({
        mutationFn: (debtId: string) => api.payStudentDebt(debtId),
        onSuccess: () => {
            toast.success('Utang berhasil dilunasi!');
            queryClient.invalidateQueries({ queryKey: ['studentTransactions', studentId] });
            closePayDebtModal();
        },
        onError: (err) => toast.error((err as Error).message),
    });

    const onSavingSubmit = (data: SavingInputs) => savingMutation.mutate(data);
    const onDebtSubmit = (data: DebtInputs) => debtMutation.mutate(data);
    const onConfirmPayDebt = () => {
        if (debtToPay) payDebtMutation.mutate(debtToPay.id);
    };

    // Modal handlers
    const openSavingModal = () => { resetSaving(); setIsSavingModalOpen(true); };
    const closeSavingModal = () => setIsSavingModalOpen(false);
    const openDebtModal = () => { resetDebt(); setIsDebtModalOpen(true); };
    const closeDebtModal = () => setIsDebtModalOpen(false);
    const openPayDebtModal = (debt: StudentDebt) => { setDebtToPay(debt); setIsPayDebtModalOpen(true); };
    const closePayDebtModal = () => { setDebtToPay(null); setIsPayDebtModalOpen(false); };
    
    const allTransactions = useMemo(() => {
        if (!transactions) return [];
        const savingsWithType = transactions.savings.data.map(s => ({ ...s, txType: 'SAVING' as const }));
        const debtsWithType = transactions.debts.data.map(d => ({ ...d, txType: 'DEBT' as const }));
        
        return [...savingsWithType, ...debtsWithType].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [transactions]);

    if (!user?.classManaged) {
        return <EmptyState message="Anda tidak ditugaskan sebagai wali kelas manapun." />;
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Transaksi Siswa - Kelas {user.classManaged}</h1>
            
            <div className="mb-6">
                <label htmlFor="student-select" className="block text-sm font-medium text-slate-700 mb-1">Pilih Siswa</label>
                <FormSelect id="student-select" label="" onChange={e => setSelectedStudent(students?.find(s => s.id === e.target.value) || null)}>
                    <option value="">-- Pilih Siswa --</option>
                    {students?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>)}
                </FormSelect>
            </div>

            {isLoadingStudents && <LoadingSpinner />}
            
            {!selectedStudent && !isLoadingStudents && <EmptyState message="Silakan pilih siswa untuk melihat transaksi." />}

            {selectedStudent && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800">{selectedStudent.name}</h3>
                            <p className="text-sm text-slate-500">NIS: {selectedStudent.nis}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                            <WalletIcon className="text-emerald-500" size={8} />
                            <div>
                                <p className="text-sm text-slate-500">Saldo Tabungan</p>
                                <p className="text-2xl font-bold text-slate-800">Rp {transactions?.student.balance.toLocaleString('id-ID') ?? '...'}</p>
                            </div>
                        </div>
                         <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                            <DebtIcon className="text-rose-500" size={8} />
                            <div>
                                <p className="text-sm text-slate-500">Total Utang</p>
                                <p className="text-2xl font-bold text-slate-800">Rp {transactions?.student.totalDebt.toLocaleString('id-ID') ?? '...'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                             <h2 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
                             <div className="flex gap-2">
                                <FormButton onClick={openSavingModal}><AddIcon/> Tabungan</FormButton>
                                <FormButton onClick={openDebtModal} variant="secondary"><AddIcon/> Utang</FormButton>
                             </div>
                        </div>
                       
                        {isLoadingTransactions ? <LoadingSpinner /> : (
                            <ul className="divide-y divide-slate-200">
                                {allTransactions.length === 0 ? <li className="py-4 text-center text-slate-500">Belum ada transaksi.</li> : allTransactions.map(tx => (
                                    <li key={`${tx.txType}-${tx.id}`} className="py-3 flex justify-between items-center">
                                       {tx.txType === 'SAVING' ? (
                                           <>
                                            <div>
                                                <p className={`font-semibold ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    <span className="print:hidden">
                                                        {tx.type === SavingType.DEPOSIT ? <DepositIcon className="inline mr-2"/> : <TransactionIcon className="inline mr-2"/>}
                                                    </span>
                                                    {tx.notes || (tx.type === SavingType.DEPOSIT ? 'Setoran' : 'Penarikan')}
                                                </p>
                                                <p className="text-sm text-slate-500 pl-8">{new Date(tx.createdAt).toLocaleString('id-ID')}</p>
                                            </div>
                                            <p className={`font-bold ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {tx.type === SavingType.DEPOSIT ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                                            </p>
                                           </>
                                       ) : (
                                            <>
                                            <div>
                                                <p className="font-semibold text-rose-600">
                                                    <DebtIcon className="inline mr-2"/>
                                                    Utang: {tx.notes || 'Tidak ada catatan'}
                                                </p>
                                                 <p className="text-sm text-slate-500 pl-8">{new Date(tx.createdAt).toLocaleString('id-ID')}</p>
                                            </div>
                                            <div className="text-right">
                                                 <p className="font-bold text-rose-600">- Rp {tx.amount.toLocaleString('id-ID')}</p>
                                                 {tx.isPaid ? 
                                                    <span className="text-xs text-emerald-600 font-semibold">Lunas</span> : 
                                                    <button onClick={() => openPayDebtModal(tx)} className="text-xs text-blue-600 hover:underline">Bayar</button>}
                                            </div>
                                            </>
                                       )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
            
            {/* Modals */}
            <Modal isOpen={isSavingModalOpen} onClose={closeSavingModal} title={`Transaksi Tabungan: ${selectedStudent?.name}`}>
                <form onSubmit={handleSubmitSaving(onSavingSubmit)} className="space-y-4">
                    <FormSelect id="type" label="Tipe Transaksi" {...registerSaving('type', { required: true })}>
                        <option value={SavingType.DEPOSIT}>Setoran (Menabung)</option>
                        <option value={SavingType.WITHDRAWAL}>Penarikan</option>
                    </FormSelect>
                    <FormInput id="amount" label="Jumlah" type="number" {...registerSaving('amount', { required: 'Jumlah harus diisi', valueAsNumber: true, min: 1 })} error={savingErrors.amount?.message} />
                    <FormInput id="notes" label="Catatan (Opsional)" {...registerSaving('notes')} />
                    <div className="flex justify-end gap-3 pt-2">
                        <FormButton type="button" variant="secondary" onClick={closeSavingModal}>Batal</FormButton>
                        <FormButton type="submit" disabled={savingMutation.isPending}>{savingMutation.isPending ? 'Menyimpan...' : 'Simpan'}</FormButton>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isDebtModalOpen} onClose={closeDebtModal} title={`Catat Utang: ${selectedStudent?.name}`}>
                <form onSubmit={handleSubmitDebt(onDebtSubmit)} className="space-y-4">
                    <FormInput id="amount" label="Jumlah Utang" type="number" {...registerDebt('amount', { required: 'Jumlah harus diisi', valueAsNumber: true, min: 1 })} error={debtErrors.amount?.message} />
                    <FormInput id="notes" label="Catatan (Opsional)" {...registerDebt('notes')} />
                    <div className="flex justify-end gap-3 pt-2">
                        <FormButton type="button" variant="secondary" onClick={closeDebtModal}>Batal</FormButton>
                        <FormButton type="submit" disabled={debtMutation.isPending}>{debtMutation.isPending ? 'Menyimpan...' : 'Simpan'}</FormButton>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal
                isOpen={isPayDebtModalOpen}
                onClose={closePayDebtModal}
                onConfirm={onConfirmPayDebt}
                title="Konfirmasi Pelunasan"
                message={`Anda yakin ingin menandai utang sebesar Rp ${debtToPay?.amount.toLocaleString('id-ID')} sebagai LUNAS?`}
                confirmText="Ya, Lunas"
                isConfirming={payDebtMutation.isPending}
                confirmVariant="success"
            />
        </div>
    );
};

export default StudentTransactions;
