

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { api } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ClassData, User } from '../../types';
import { AddIcon, EditIcon, DeleteIcon, UserCircleIcon, AcademicCapIcon, UserGroupIcon, DataMasterIcon } from '../../components/Icons';
import { useForm } from 'react-hook-form';
import FormButton from '../../components/FormButton';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

type ClassInputs = {
    id?: string;
    name: string;
};

type AssignTeacherInputs = {
    classId: string;
    waliKelasId: string | null;
}

const ClassManagement = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
    const [page, setPage] = useState(1);
    
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClassInputs>();
    const { register: registerAssign, handleSubmit: handleSubmitAssign, reset: resetAssign, setValue: setValueAssign } = useForm<AssignTeacherInputs>();

    const { data: classesData, isLoading: isLoadingClasses } = useQuery({
        queryKey: ['classes', page],
        queryFn: () => api.getClasses({ page, limit: 10 }),
        placeholderData: (previousData) => previousData,
    });

    const { data: availableTeachers, isLoading: isLoadingTeachers } = useQuery<User[]>({
        queryKey: ['availableTeachers'],
        queryFn: api.getAvailableTeachers,
        enabled: isAssignModalOpen, // Only fetch when the assign modal is open
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

    const classes = classesData?.data ?? [];
    const totalClasses = classesData?.total ?? 0;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manajemen Kelas</h1>
                <FormButton onClick={handleAdd}>
                    <AddIcon />
                    <span>Tambah Kelas</span>
                </FormButton>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                {isLoadingClasses && !classesData ? (
                    <TableSkeleton cols={4} />
                ) : !classes || classes.length === 0 ? (
                    <EmptyState message="Belum ada data kelas." icon={<DataMasterIcon size={12} />} />
                ) : (
                    <>
                        {/* Table for Desktop */}
                        <div className="overflow-x-auto hidden md:block">
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
                        </div>

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
                <Pagination
                    currentPage={page}
                    totalItems={totalClasses}
                    itemsPerPage={10}
                    onPageChange={setPage}
                />
            </div>

             {/* Modals */}
             <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedClass ? 'Edit Kelas' : 'Tambah Kelas'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                        id="name"
                        label="Nama Kelas"
                        {...register('name', { required: 'Nama kelas tidak boleh kosong' })}
                        error={errors.name?.message}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <FormButton type="button" variant="secondary" onClick={closeModal}>Batal</FormButton>
                        <FormButton type="submit" disabled={classMutation.isPending}>{classMutation.isPending ? 'Menyimpan...' : 'Simpan'}</FormButton>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isAssignModalOpen} onClose={closeAssignModal} title={`Atur Wali Kelas untuk ${selectedClass?.name}`}>
                 <form onSubmit={handleSubmitAssign(onAssignSubmit)} className="space-y-4">
                    {isLoadingTeachers ? <div className="h-10 animate-pulse bg-slate-200 rounded-md"></div> : (
                    <FormSelect
                        id="waliKelasId"
                        label="Pilih Guru"
                        {...registerAssign('waliKelasId')}
                    >
                        <option value="">-- Lepas Jabatan --</option>
                        {selectedClass?.waliKelasName && <option value={selectedClass.waliKelasId!}>{selectedClass.waliKelasName} (Saat ini)</option>}
                        {availableTeachers?.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>{teacher.username}</option>
                        ))}
                    </FormSelect>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <FormButton type="button" variant="secondary" onClick={closeAssignModal}>Batal</FormButton>
                        <FormButton type="submit" disabled={assignTeacherMutation.isPending}>{assignTeacherMutation.isPending ? 'Menyimpan...' : 'Simpan'}</FormButton>
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
