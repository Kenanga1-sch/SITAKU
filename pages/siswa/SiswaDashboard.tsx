

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Saving, StudentDebt, SavingType } from '../../types';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { TransactionIcon, DepositIcon, DebtIcon, WalletIcon, WarningIcon } from '../../components/Icons';

const SiswaDashboard: React.FC = () => {
    const { user } = useAuth();
    
    const { data, isLoading, error } = useQuery({
        queryKey: ['siswaDashboard', user?.studentProfile?.id],
        queryFn: async () => {
            if (!user?.studentProfile?.id) {
                throw new Error("Student profile not found");
            }
            const student = await api.getStudentById(user.studentProfile.id);
            const savings = await api.getSavingsByStudent(student.id);
            const debts = await api.getDebtsByStudent(student.id);
            const allTxs = [...savings.map(s => ({...s, txType: 'SAVING' as const})), ...debts.map(d => ({...d, txType: 'DEBT' as const }))]
                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { student, transactions: allTxs };
        },
        enabled: !!user?.studentProfile
    });

    if (isLoading) return <div className="flex justify-center mt-20"><LoadingSpinner /></div>;
    
    if (error || !data) {
        return <EmptyState message="Gagal memuat data siswa." icon={<WarningIcon size={12} />} />;
    }

    const { student: studentData, transactions } = data;
    
    const getTxDetails = (tx: (Saving & {txType: 'SAVING'}) | (StudentDebt & {txType: 'DEBT'})) => {
        if (tx.txType === 'SAVING') {
            if (tx.type === SavingType.DEPOSIT) {
                return {
                    title: 'Setor Tabungan',
                    colorClass: 'text-emerald-600',
                    amountPrefix: '+',
                    icon: <DepositIcon className="text-emerald-500" />
                };
            }
            return {
                title: 'Tarik Tabungan',
                colorClass: 'text-amber-600',
                amountPrefix: '-',
                icon: <TransactionIcon className="text-amber-500" />
            };
        }
        return {
            title: `Utang: ${tx.notes || 'Lainnya'}`,
            colorClass: 'text-rose-600',
            amountPrefix: '',
            icon: <DebtIcon className="text-rose-500" />
        };
    };

    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Halo, {studentData.name}!</h1>
            <p className="text-slate-600 mb-6 sm:mb-8">Berikut adalah ringkasan keuanganmu.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-emerald-500">
                    <p className="text-base sm:text-lg font-semibold text-slate-600">Saldo Tabungan</p>
                    <p className="text-3xl sm:text-4xl font-bold text-emerald-600 mt-2">Rp {studentData.balance.toLocaleString('id-ID')}</p>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-rose-500">
                    <p className="text-base sm:text-lg font-semibold text-slate-600">Total Utang</p>
                    <p className="text-3xl sm:text-4xl font-bold text-rose-600 mt-2">Rp {studentData.totalDebt.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Riwayat Transaksi</h2>
                <div className="overflow-y-auto max-h-[28rem] pr-2 -mr-2">
                    {transactions.length === 0 ? (
                        <EmptyState message="Kamu belum memiliki transaksi." icon={<WalletIcon size={12} />} />
                    ) : (
                    <ul className="divide-y divide-slate-200">
                        {transactions.map(tx => {
                            const { title, colorClass, amountPrefix, icon } = getTxDetails(tx);
                            const amount = tx.txType === 'DEBT' ? tx.amount : tx.amount;
                            
                            return (
                                <li key={`${tx.txType}-${tx.id}`} className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-4">
                                        <span className="flex-shrink-0">{icon}</span>
                                        <div>
                                            <p className="font-semibold text-slate-700">{title}</p>
                                            <p className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold text-base sm:text-lg ${colorClass} text-right`}>
                                        {amountPrefix} Rp {amount.toLocaleString('id-ID')}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiswaDashboard;
