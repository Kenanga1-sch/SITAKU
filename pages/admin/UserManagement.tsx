
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { User, Role } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { AddIcon, EditIcon, DeleteIcon, UserGroupIcon } from '../../components/Icons';

type UserInputs = Omit<User, 'id'> & { id?: string; password?: string };

const UserManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserInputs>();

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: api.getAllUsers,
    });

    const userMutation = useMutation({
        mutationFn: (data: UserInputs) => {
            const { id, ...userData } = data;
            // Don't send empty password
            if (userData.password === '') {
                delete userData.password;
            }
            return id ? api.updateUser(id, userData) : api.createUser(userData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeModal();
            toast.success(`User berhasil ${selectedUser ? 'diperbarui' : 'ditambahkan'}!`);
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal menyimpan data.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeConfirmModal();
            toast.success('User berhasil dihapus!');
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal menghapus data.');
        }
    });

    const handleAdd = () => {
        setSelectedUser(null);
        reset({ username: '', role: Role.GURU, password: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setValue('id', user.id);
        setValue('username', user.username);
        setValue('role', user.role);
        setValue('password', '');
        setIsModalOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setIsConfirmModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedUser(null);
    };

    const onSubmit = (data: UserInputs) => {
        userMutation.mutate(data);
    };

    const onConfirmDelete = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser.id);
        }
    };
    
    const getRoleDisplayName = (role: Role) => {
        return role.charAt(0) + role.slice(1).toLowerCase();
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Pengguna</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                    <AddIcon />
                    <span>Tambah Pengguna</span>
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                {isLoading ? (
                    <LoadingSpinner />
                ) : !users || users.length === 0 ? (
                    <EmptyState message="Belum ada data pengguna." icon={<UserGroupIcon size={12}/>} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getRoleDisplayName(user.role)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button>
                                            <button onClick={() => handleDelete(user)} className="text-rose-600 hover:text-rose-900"><DeleteIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                        <input
                            id="username"
                            {...register('username', { required: 'Username tidak boleh kosong' })}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {errors.username && <p className="text-sm text-rose-600 mt-1">{errors.username.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                        <select
                            id="role"
                            {...register('role', { required: 'Role harus dipilih' })}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value={Role.ADMIN}>Admin</option>
                            <option value={Role.GURU}>Guru</option>
                            <option value={Role.BENDAHARA}>Bendahara</option>
                            <option value={Role.SISWA}>Siswa</option>
                        </select>
                         {errors.role && <p className="text-sm text-rose-600 mt-1">{errors.role.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            {...register('password', { required: !selectedUser && 'Password tidak boleh kosong' })}
                            placeholder={selectedUser ? "Kosongkan jika tidak ingin mengubah" : ""}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                         {errors.password && <p className="text-sm text-rose-600 mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200">Batal</button>
                        <button type="submit" disabled={userMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{userMutation.isPending ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={onConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Anda yakin ingin menghapus user "${selectedUser?.username}"? Aksi ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                isConfirming={deleteMutation.isPending}
            />
        </div>
    );
};

export default UserManagement;
