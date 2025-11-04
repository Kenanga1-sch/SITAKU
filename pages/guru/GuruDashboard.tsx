
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const GuruDashboard: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Guru</h1>
            <p className="text-slate-600 mb-8">Selamat datang, {user?.username}!</p>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                 <h2 className="text-xl font-bold text-slate-800">Kelas Wali: {user?.classManaged || 'Belum ada'}</h2>
                <p className="text-slate-600 mt-2">Gunakan menu di samping untuk mencatat transaksi siswa dan melakukan setoran harian.</p>
            </div>
        </div>
    );
};

export default GuruDashboard;
