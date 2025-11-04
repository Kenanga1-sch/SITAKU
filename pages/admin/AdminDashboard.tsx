

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import BarChart from '../../components/BarChart';
import { UserGroupIcon, UserCircleIcon, DataMasterIcon, ChartBarIcon } from '../../components/Icons';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['adminStats'],
        queryFn: api.getAdminStats
    });

    const { data: userRoleData, isLoading: isLoadingChart } = useQuery({
        queryKey: ['userRoleChart'],
        queryFn: api.getUserRoleChartData
    });

    if (isLoadingStats) {
        return <div className="flex justify-center mt-20"><LoadingSpinner /></div>;
    }

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Dashboard Admin</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <StatCard 
                    title="Total Pengguna" 
                    value={stats?.totalUsers ?? 0} 
                    icon={<UserGroupIcon />} 
                    color="blue"
                />
                <StatCard 
                    title="Total Siswa" 
                    value={stats?.totalStudents ?? 0} 
                    icon={<UserCircleIcon />} 
                    color="green"
                />
                <StatCard 
                    title="Total Kelas" 
                    value={stats?.totalClasses ?? 0} 
                    icon={<DataMasterIcon />} 
                    color="purple"
                />
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ChartBarIcon />
                        Distribusi Peran Pengguna
                    </h2>
                    <div className="mt-4 h-64">
                        {isLoadingChart ? <LoadingSpinner/> : userRoleData ? <BarChart data={userRoleData} /> : <p>Data tidak tersedia.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
