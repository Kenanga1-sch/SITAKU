
import React from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, DataMasterIcon } from '../../components/Icons';

const DataMaster: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Data Master</h1>
            <p className="text-slate-600 mb-8">Pilih kategori data master yang ingin Anda kelola.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/admin/users" className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <span className="text-blue-500"><UserGroupIcon size={8} /></span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Manajemen User</h2>
                            <p className="text-slate-500">Kelola akun Admin, Guru, Bendahara, dan Siswa.</p>
                        </div>
                    </div>
                </Link>
                <Link to="/admin/classes" className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex items-center gap-4">
                        <span className="text-purple-500"><DataMasterIcon size={8} /></span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Manajemen Kelas</h2>
                            <p className="text-slate-500">Kelola daftar kelas dan wali kelas.</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default DataMaster;
