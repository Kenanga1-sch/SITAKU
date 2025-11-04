
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Saving, StudentDebt, SavingType } from '../../types';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const SiswaDashboard: React.FC = () => {
    const { user } = useAuth();
    
    const { data, isLoading } = useQuery({
        queryKey: ['siswaDashboard', user?.studentProfile?.id],
        queryFn: async () => {
            const student = user!.studentProfile!;
            const savings = await api.getSavingsByStudent(student.id);
            const debts = await api.getDebtsByStudent(student.id);
            const allTxs = [...savings.map(s => ({...s, txType: 'SAVING'})), ...debts.map(d => ({...d, txType: 'DEBT'}))]
                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { student, transactions: allTxs };
        },
        enabled: !!user?.studentProfile
    });

    if (isLoading) return <div className="flex justify-center mt-20"><LoadingSpinner /></div>;
    
    if (!data) {
        return <EmptyState message="Data siswa tidak ditemukan." />;
    }

    const { student: studentData, transactions } = data;
    
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Halo, {studentData.name}!</h1>
            <p className="text-slate-600 mb-8">Berikut adalah ringkasan keuanganmu.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center border-t-4 border-emerald-500">
                    <p className="text-lg font-semibold text-slate-600">Saldo Tabungan</p>
                    <p className="text-4xl font-bold text-emerald-600 mt-2">Rp {studentData.balance.toLocaleString('id-ID')}</p>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm text-center border-t-4 border-rose-500">
                    <p className="text-lg font-semibold text-slate-600">Total Utang</p>
                    <p className="text-4xl font-bold text-rose-600 mt-2">Rp {studentData.totalDebt.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Riwayat Transaksi</h2>
                <div className="overflow-y-auto max-h-96 pr-2">
                    {transactions.length === 0 ? (
                        <EmptyState message="Kamu belum memiliki transaksi." />
                    ) : (
                    <table className="min-w-full">
                        <tbody className="divide-y divide-slate-200">
                            {transactions.map(tx => {
                                let title = '';
                                let colorClass = '';
                                let amountPrefix = '';

                                if (tx.txType === 'SAVING') {
                                    const saving = tx as Saving;
                                    if (saving.type === SavingType.DEPOSIT) {
                                        title = 'Setor Tabungan';
                                        colorClass = 'text-emerald-600';
                                        amountPrefix = '+';
                                    } else {
                                        title = 'Tarik Tabungan';
                                        colorClass = 'text-amber-600';
                                        amountPrefix = '-';
                                    }
                                } else {
                                    const debt = tx as StudentDebt;
                                    title = `Utang: ${debt.notes}`;
                                    colorClass = 'text-rose-600';
                                    amountPrefix = '-';
                                }

                                return (
                                    <tr key={tx.id}>
                                        <td className="py-4 px-2">
                                            <p className="font-semibold text-slate-700">{title}</p>
                                            <p className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </td>
                                        <td className={`py-4 px-2 text-right font-bold text-lg ${colorClass}`}>
                                            {amountPrefix} Rp {tx.amount.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiswaDashboard;