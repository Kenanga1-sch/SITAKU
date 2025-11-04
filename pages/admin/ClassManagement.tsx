

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ClassData, User } from '../../types';
// Fix: Import DataMasterIcon
import { AddIcon, EditIcon, DeleteIcon, UserCircleIcon, AcademicCapIcon, UserGroupIcon, DataMasterIcon } from '../../components/Icons';
import { useForm } from 'react-hook-form';

type ClassInputs = {
    id?: string;
    name: string;
};

type AssignTeacherInputs = {
    classId: string;
    waliKelasId: string | null;
}

const ClassManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
    
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClassInputs>();
    const { register: registerAssign, handleSubmit: handleSubmitAssign, reset: resetAssign, setValue: setValueAssign } = useForm<AssignTeacherInputs>();

    const { data: classes, isLoading: isLoadingClasses } = useQuery<ClassData[]>({
        queryKey: ['classes'],
        queryFn: api.getAllClasses,
    });

    const { data: availableTeachers, isLoading: isLoadingTeachers } = useQuery<User[]>({
        queryKey: ['availableTeachers'],
        queryFn: api.getAvailableTeachers,
    });

    const classMutation = useMutation({
        mutationFn: (data: ClassInputs) => selectedClass ? api.updateClass(data.id!, data) : api.createClass(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['availableTeachers'] });
            closeModal();
        },
    });

    const assignTeacherMutation = useMutation({
        mutationFn: (data: AssignTeacherInputs) => api.assignWaliKelas(data.classId, data.waliKelasId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['availableTeachers'] });
            closeAssignModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteClass(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['availableTeachers'] });
            closeConfirmModal();
        }
    });

    const handleAdd = () => {
        setSelectedClass(null);
        reset({ id: undefined, name: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (cls: ClassData) => {
        setSelectedClass(cls);
        setValue('id', cls.id);
        setValue('name', cls.name);
        setIsModalOpen(true);
    };
    
    const handleAssign = (cls: ClassData) => {
        setSelectedClass(cls);
        setValueAssign('classId', cls.id);
        setValueAssign('waliKelasId', cls.waliKelasId);
        setIsAssignModalOpen(true);
    };

    const handleDelete = (cls: ClassData) => {
        setSelectedClass(cls);
        setIsConfirmModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClass(null);
    };

    const closeAssignModal = () => {
        setIsAssignModalOpen(false);
        setSelectedClass(null);
    };
    
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedClass(null);
    };

    const onSubmit = (data: ClassInputs) => {
        toast.promise(classMutation.mutateAsync(data), {
            loading: 'Menyimpan...',
            success: `Kelas berhasil ${selectedClass ? 'diperbarui' : 'ditambahkan'}!`,
            error: (err) => (err as Error).message || 'Gagal menyimpan data.',
        });
    };
    
    const onAssignSubmit = (data: AssignTeacherInputs) => {
        toast.promise(assignTeacherMutation.mutateAsync(data), {
            loading: 'Menyimpan...',
            success: 'Wali kelas berhasil diatur!',
            error: (err) => (err as Error).message || 'Gagal menyimpan data.',
        });
    };
    
    const onConfirmDelete = () => {
        if (selectedClass) {
            toast.promise(deleteMutation.mutateAsync(selectedClass.id), {
                loading: 'Menghapus...',
                success: 'Kelas berhasil dihapus!',
                error: (err) => (err as Error).message || 'Gagal menghapus data.',
            });
        }
    };


    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manajemen Kelas</h1>
                <button onClick={handleAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                    <AddIcon />
                    <span>Tambah Kelas</span>
                </button>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                {isLoadingClasses ? (
                    <LoadingSpinner />
                ) : !classes || classes.length === 0 ? (
                    <EmptyState message="Belum ada data kelas." icon={<DataMasterIcon size={12} />} />
                ) : (
                    <>
                        {/* Table for Desktop */}
                        <table className="min-w-full divide-y divide-slate-200 hidden md:table">
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
                                    <tr key={cls.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{cls.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cls.waliKelasName || <span className="italic text-slate-400">Belum diatur</span>}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cls.studentCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleAssign(cls)} className="text-emerald-600 hover:text-emerald-900" title="Atur Wali Kelas"><UserCircleIcon /></button>
                                            <button onClick={() => handleEdit(cls)} className="text-indigo-600 hover:text-indigo-900" title="Edit Kelas"><EditIcon /></button>
                                            <button onClick={() => handleDelete(cls)} className="text-rose-600 hover:text-rose-900" title="Hapus Kelas"><DeleteIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Cards for Mobile */}
                        <div className="md:hidden space-y-4">
                             {classes.map((cls) => (
                                <div key={cls.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                                <AcademicCapIcon /> <span>{cls.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <UserCircleIcon /> <span>{cls.waliKelasName || <span className="italic text-slate-400">Belum diatur</span>}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <UserGroupIcon /> <span>{cls.studentCount} Siswa</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                             <button onClick={() => handleAssign(cls)} className="p-2 text-emerald-600 bg-emerald-100 rounded-full" title="Atur Wali Kelas"><UserCircleIcon size={5} /></button>
                                             <button onClick={() => handleEdit(cls)} className="p-2 text-indigo-600 bg-indigo-100 rounded-full" title="Edit Kelas"><EditIcon size={5} /></button>
                                             <button onClick={() => handleDelete(cls)} className="p-2 text-rose-600 bg-rose-100 rounded-full" title="Hapus Kelas"><DeleteIcon size={5} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

             {/* Modals */}
             <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedClass ? 'Edit Kelas' : 'Tambah Kelas'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Kelas</label>
                        <input
                            id="name"
                            {...register('name', { required: 'Nama kelas tidak boleh kosong' })}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {errors.name && <p className="text-sm text-rose-600 mt-1">{errors.name.message}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200">Batal</button>
                        <button type="submit" disabled={classMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{classMutation.isPending ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isAssignModalOpen} onClose={closeAssignModal} title={`Atur Wali Kelas untuk ${selectedClass?.name}`}>
                 <form onSubmit={handleSubmitAssign(onAssignSubmit)} className="space-y-4">
                    {isLoadingTeachers ? <LoadingSpinner /> : (
                    <div>
                        <label htmlFor="waliKelasId" className="block text-sm font-medium text-slate-700">Pilih Guru</label>
                        <select
                            id="waliKelasId"
                            {...registerAssign('waliKelasId')}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- Lepas Jabatan --</option>
                            {selectedClass?.waliKelasName && <option value={selectedClass.waliKelasId!}>{selectedClass.waliKelasName} (Saat ini)</option>}
                            {availableTeachers?.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.username}</option>
                            ))}
                        </select>
                    </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeAssignModal} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200">Batal</button>
                        <button type="submit" disabled={assignTeacherMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{assignTeacherMutation.isPending ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={onConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Anda yakin ingin menghapus kelas "${selectedClass?.name}"? Aksi ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                isConfirming={deleteMutation.isPending}
            />
        </div>
    );
};

export default ClassManagement;