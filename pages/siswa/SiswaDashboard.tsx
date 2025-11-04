import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import { WalletIcon, DebtIcon, DepositIcon, TransactionIcon } from '../../components/Icons';
import { SavingType, StudentDebt, Saving } from '../../types';

const SiswaDashboard = () => {
    const { user } = useAuth();

    const { data, isLoading, error } = useQuery({
        queryKey: ['siswaDashboard'],
        queryFn: api.getSiswaDashboardData,
        enabled: !!user,
    });

    const allTransactions = useMemo(() => {
        if (!data) return [];
        const savingsWithType = data.savings.map(s => ({ ...s, txType: 'SAVING' as const, key: `saving-${s.id}` }));
        const debtsWithType = data.debts.map(d => ({ ...d, txType: 'DEBT' as const, key: `debt-${d.id}` }));

        return [...savingsWithType, ...debtsWithType]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10); // Show latest 10 transactions
    }, [data]);

    if (isLoading) {
        return <div className="flex justify-center mt-20"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-rose-500">Gagal memuat data. Coba lagi nanti.</div>;
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Siswa</h1>
            <p className="text-slate-600 mb-8">Selamat datang, {data?.student.name}!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard 
                    title="Saldo Tabungan Anda"
                    value={`Rp ${data?.student.balance.toLocaleString('id-ID') ?? 0}`}
                    icon={<WalletIcon />}
                    color="green"
                />
                <StatCard 
                    title="Total Utang Anda"
                    value={`Rp ${data?.student.totalDebt.toLocaleString('id-ID') ?? 0}`}
                    icon={<DebtIcon />}
                    color="red"
                />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">10 Transaksi Terakhir</h2>
                <div className="overflow-x-auto">
                    <ul className="divide-y divide-slate-200">
                        {allTransactions.length === 0 ? (
                            <li className="py-4 text-center text-slate-500">Tidak ada riwayat transaksi.</li>
                        ) : (
                            allTransactions.map(tx => (
                                <li key={tx.key} className="py-3 flex justify-between items-center">
                                    {tx.txType === 'SAVING' ? (
                                        <>
                                            <div>
                                                <p className={`font-semibold ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {tx.type === SavingType.DEPOSIT ? <DepositIcon className="inline mr-2"/> : <TransactionIcon className="inline mr-2"/>}
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
                                                {tx.isPaid && <span className="text-xs text-emerald-600 font-semibold">Lunas</span>}
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SiswaDashboard;
