
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import { UserGroupIcon, UserCircleIcon, DataMasterIcon } from '../../components/Icons';

const AdminDashboard: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: api.getAdminStats
    });

    if (isLoading) {
        return <div className="flex justify-center mt-20"><LoadingSpinner /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard Admin</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Selamat Datang!</h2>
                <p className="text-slate-600 mt-2">Gunakan menu di samping untuk mengelola pengguna, kelas, dan data master lainnya.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
