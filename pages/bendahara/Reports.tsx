
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Saving, SavingType } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import StatCard from '../../components/StatCard';
import { WalletIcon, DebtIcon, DepositIcon, TransactionIcon } from '../../components/Icons';
import FormInput from '../../components/FormInput';
import TableSkeleton from '../../components/TableSkeleton';

const Reports: React.FC = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['globalStats'],
        queryFn: api.getGlobalStats,
    });

    const { data: savingsData, isLoading: isLoadingSavings } = useQuery({
        queryKey: ['allSavings', page, filters],
        queryFn: () => api.getAllSavings({ page, limit: 15, ...filters }),
        placeholderData: (previousData) => previousData,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const savings = savingsData?.data ?? [];
    const totalSavings = savingsData?.total ?? 0;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Laporan Keuangan</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                 {isLoadingStats ? <div className="col-span-full"><LoadingSpinner /></div> : (
                    <>
                    <StatCard 
                        title="Total Saldo Siswa" 
                        value={`Rp ${stats?.totalBalance.toLocaleString('id-ID') ?? 0}`}
                        icon={<WalletIcon />} 
                        color="green"
                    />
                     <StatCard 
                        title="Total Utang Siswa" 
                        value={`Rp ${stats?.totalStudentDebt.toLocaleString('id-ID') ?? 0}`}
                        icon={<DebtIcon />} 
                        color="red"
                    />
                    <StatCard 
                        title="Total Utang Staff" 
                        value={`Rp ${stats?.totalStaffDebt.toLocaleString('id-ID') ?? 0}`}
                        icon={<DebtIcon />} 
                        color="yellow"
                    />
                    </>
                 )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Rekening Koran (Semua Transaksi Tabungan)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput
                        id="startDate"
                        label="Dari Tanggal"
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                    />
                    <FormInput
                        id="endDate"
                        label="Sampai Tanggal"
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="overflow-x-auto">
                    {isLoadingSavings && !savingsData ? <TableSkeleton cols={5} rows={10}/> : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Siswa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipe</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dicatat Oleh</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {savings.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(tx.createdAt).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{tx.studentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                tx.type === SavingType.DEPOSIT ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {tx.type === SavingType.DEPOSIT ? <DepositIcon size={4}/> : <TransactionIcon size={4}/>}
                                                {tx.type === SavingType.DEPOSIT ? 'Setoran' : 'Penarikan'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {tx.type === SavingType.DEPOSIT ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{tx.createdByName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                 <Pagination
                    currentPage={page}
                    totalItems={totalSavings}
                    itemsPerPage={15}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

export default Reports;
