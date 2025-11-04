
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';
import BarChart from '../../components/BarChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { WalletIcon, DebtIcon, UserGroupIcon, ChartBarIcon } from '../../components/Icons';

const BendaharaDashboard = () => {
    const { user } = useAuth();

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['bendaharaStats'],
        queryFn: api.getGlobalStats,
    });

    const { data: financialChartData, isLoading: isLoadingChart } = useQuery({
        queryKey: ['financialSummaryChart'],
        queryFn: api.getFinancialSummaryChartData,
    });

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Bendahara</h1>
            <p className="text-slate-600 mb-8">Selamat datang, {user?.username}!</p>
            
            {isLoadingStats ? <LoadingSpinner /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                        icon={<UserGroupIcon />} 
                        color="yellow"
                    />
                </div>
            )}

            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <ChartBarIcon />
                    Ringkasan Keuangan
                </h2>
                <div className="mt-4 h-80">
                    {isLoadingChart ? <LoadingSpinner/> : financialChartData ? <BarChart data={financialChartData} /> : <p>Data tidak tersedia.</p>}
                </div>
            </div>
        </div>
    );
};

export default BendaharaDashboard;
