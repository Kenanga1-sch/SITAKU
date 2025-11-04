
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { Student, ClassData } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { AddIcon, EditIcon, DeleteIcon, DataMasterIcon } from '../../components/Icons';

type StudentInputs = Omit<Student, 'id' | 'balance' | 'totalDebt'> & { id?: string };

const StudentManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StudentInputs>();

    const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: api.getAllStudents,
    });
    
    const { data: classes, isLoading: isLoadingClasses } = useQuery<ClassData[]>({
        queryKey: ['classes'],
        queryFn: api.getAllClasses,
    });

    const studentMutation = useMutation({
        mutationFn: (data: StudentInputs) => {
            const { id, ...studentData } = data;
            return id ? api.updateStudent(id, studentData) : api.createStudent(studentData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            closeModal();
            toast.success(`Data siswa berhasil ${selectedStudent ? 'diperbarui' : 'ditambahkan'}!`);
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal menyimpan data.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteStudent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            closeConfirmModal();
            toast.success('Data siswa berhasil dihapus!');
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal menghapus data.');
        }
    });

    const handleAdd = () => {
        setSelectedStudent(null);
        reset({ nis: '', name: '', class: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setValue('id', student.id);
        setValue('nis', student.nis);
        setValue('name', student.name);
        setValue('class', student.class);
        setIsModalOpen(true);
    };

    const handleDelete = (student: Student) => {
        setSelectedStudent(student);
        setIsConfirmModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedStudent(null);
    };

    const onSubmit = (data: StudentInputs) => {
        studentMutation.mutate(data);
    };

    const onConfirmDelete = () => {
        if (selectedStudent) {
            deleteMutation.mutate(selectedStudent.id);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Siswa</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                    <AddIcon />
                    <span>Tambah Siswa</span>
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                {isLoadingStudents ? (
                    <LoadingSpinner />
                ) : !students || students.length === 0 ? (
                    <EmptyState message="Belum ada data siswa." icon={<DataMasterIcon size={12}/>} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">NIS</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Saldo</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.nis}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Rp {student.balance.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleEdit(student)} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button>
                                            <button onClick={() => handleDelete(student)} className="text-rose-600 hover:text-rose-900"><DeleteIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedStudent ? 'Edit Siswa' : 'Tambah Siswa'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">NIS</label>
                        <input {...register('nis', { required: 'NIS tidak boleh kosong' })} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"/>
                        {errors.nis && <p className="text-rose-600 text-sm mt-1">{errors.nis.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                        <input {...register('name', { required: 'Nama tidak boleh kosong' })} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"/>
                        {errors.name && <p className="text-rose-600 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Kelas</label>
                         <select {...register('class', { required: 'Kelas harus dipilih' })} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="">-- Pilih Kelas --</option>
                            {isLoadingClasses ? <option>Memuat...</option> : classes?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                         </select>
                        {errors.class && <p className="text-rose-600 text-sm mt-1">{errors.class.message}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-100 rounded-md">Batal</button>
                        <button type="submit" disabled={studentMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400">{studentMutation.isPending ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={onConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Anda yakin ingin menghapus data siswa "${selectedStudent?.name}"? Aksi ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                isConfirming={deleteMutation.isPending}
            />
        </div>
    );
};

export default StudentManagement;
