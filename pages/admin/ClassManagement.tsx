
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { ClassData } from '../../types';

const ClassManagement: React.FC = () => {
    const { data: classes, isLoading, error } = useQuery<ClassData[]>({
        queryKey: ['classes'],
        queryFn: api.getAllClasses,
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Kelas</h1>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Tambah Kelas
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <p className="text-red-500">Gagal memuat data kelas.</p>
                ) : !classes || classes.length === 0 ? (
                    <EmptyState message="Belum ada data kelas." />
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Wali Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah Siswa</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {classes.map((cls) => (
                                <tr key={cls.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{cls.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cls.waliKelasName || 'Belum diatur'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cls.studentCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button className="ml-4 text-rose-600 hover:text-rose-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ClassManagement;
