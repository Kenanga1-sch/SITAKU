
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { User, Role } from '../../types';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { AddIcon, EditIcon, DeleteIcon, UserGroupIcon, UserCircleIcon } from '../../components/Icons';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import FormButton from '../../components/FormButton';
import TableSkeleton from '../../components/TableSkeleton';

type UserInputs = Omit<User, 'id'> & { id?: string; password?: string };

const UserManagement = () => {
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
                <FormButton onClick={handleAdd}>
                    <AddIcon />
                    <span className="hidden sm:inline">Tambah Pengguna</span>
                </FormButton>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                {isLoading ? (
                    <TableSkeleton cols={3} />
                ) : !users || users.length === 0 ? (
                    <EmptyState message="Belum ada data pengguna." icon={<UserGroupIcon size={12}/>} />
                ) : (
                    <>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden md:block">
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
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getRoleDisplayName(user.role)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900" title="Edit"><EditIcon /></button>
                                            <button onClick={() => handleDelete(user)} className="text-rose-600 hover:text-rose-900" title="Hapus"><DeleteIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Cards */}
                     <div className="md:hidden space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{user.username}</p>
                                        <p className="text-sm text-slate-500">{getRoleDisplayName(user.role)}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleEdit(user)} className="text-indigo-600"><EditIcon /></button>
                                        <button onClick={() => handleDelete(user)} className="text-rose-600"><DeleteIcon /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput 
                        id="username"
                        label="Username"
                        {...register('username', { required: 'Username tidak boleh kosong' })}
                        error={errors.username?.message}
                    />
                    <FormSelect
                        id="role"
                        label="Role"
                        {...register('role', { required: 'Role harus dipilih' })}
                        error={errors.role?.message}
                    >
                        <option value={Role.ADMIN}>Admin</option>
                        <option value={Role.GURU}>Guru</option>
                        <option value={Role.BENDAHARA}>Bendahara</option>
                        <option value={Role.SISWA}>Siswa</option>
                    </FormSelect>
                     <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        {...register('password', { required: !selectedUser && 'Password tidak boleh kosong' })}
                        error={errors.password?.message}
                        placeholder={selectedUser ? "Kosongkan jika tidak ingin mengubah" : ""}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <FormButton type="button" variant="secondary" onClick={closeModal}>Batal</FormButton>
                        <FormButton type="submit" disabled={userMutation.isPending}>{userMutation.isPending ? 'Menyimpan...' : 'Simpan'}</FormButton>
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
