import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

import { api } from '../../services/api';
import { Student, ClassData } from '../../types';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { AddIcon, EditIcon, DeleteIcon, DataMasterIcon, WalletIcon, AcademicCapIcon, UploadIcon } from '../../components/Icons';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import FormButton from '../../components/FormButton';
import TableSkeleton from '../../components/TableSkeleton';

type StudentInputs = Omit<Student, 'id' | 'balance' | 'totalDebt'> & { id?: string };

const StudentManagement = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // State for import modal
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importErrors, setImportErrors] = useState<string[]>([]);

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
            queryClient.invalidateQueries({ queryKey: ['classes'] }); // To update student count
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
             queryClient.invalidateQueries({ queryKey: ['classes'] }); // To update student count
            closeConfirmModal();
            toast.success('Data siswa berhasil dihapus!');
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal menghapus data.');
        }
    });

    const importMutation = useMutation({
        mutationFn: (data: { nis: string; name: string; class: string }[]) => api.importStudents(data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            if (result.errorCount > 0) {
                toast.error(`${result.errorCount} data gagal diimpor. Periksa detail di modal.`);
                setImportErrors(result.errors);
            } else {
                toast.success(`${result.successCount} siswa berhasil diimpor!`);
                handleCloseImportModal();
            }
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal memproses file.');
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
    
    // --- Import Handlers ---
    const handleOpenImportModal = () => {
        setImportFile(null);
        setImportErrors([]);
        setIsImportModalOpen(true);
    };

    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImportFile(e.target.files[0]);
            setImportErrors([]);
        }
    };
    
    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,nis,name,class\n1004,Contoh Siswa,10-A\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_import_siswa.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleImportSubmit = () => {
        if (!importFile) {
            toast.error("Silakan pilih file CSV terlebih dahulu.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                toast.error("Tidak dapat membaca file.");
                return;
            }

            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                toast.error("File CSV kosong atau hanya berisi header.");
                return;
            }

            const header = lines[0].split(',').map(h => h.trim().toLowerCase());
            if (header[0] !== 'nis' || header[1] !== 'name' || header[2] !== 'class') {
                toast.error("Header CSV tidak valid. Harusnya: nis,name,class");
                return;
            }

            const studentsToImport = lines.slice(1).map(line => {
                const [nis, name, studentClass] = line.split(',').map(field => field.trim());
                return { nis, name, class: studentClass };
            });

            importMutation.mutate(studentsToImport);
        };
        reader.readAsText(importFile);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Siswa</h1>
                <div className="flex items-center gap-2">
                    <FormButton variant="secondary" onClick={handleOpenImportModal}>
                        <UploadIcon />
                        <span className="hidden sm:inline">Import Siswa</span>
                    </FormButton>
                    <FormButton onClick={handleAdd}>
                        <AddIcon />
                        <span className="hidden sm:inline">Tambah Siswa</span>
                    </FormButton>
                </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                {isLoadingStudents ? (
                    <TableSkeleton cols={5} />
                ) : !students || students.length === 0 ? (
                    <EmptyState message="Belum ada data siswa." icon={<DataMasterIcon size={12}/>} />
                ) : (
                    <>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden md:block">
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
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.nis}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Rp {student.balance.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleEdit(student)} className="text-indigo-600 hover:text-indigo-900" title="Edit"><EditIcon /></button>
                                            <button onClick={() => handleDelete(student)} className="text-rose-600 hover:text-rose-900" title="Hapus"><DeleteIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {students.map(student => (
                            <div key={student.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{student.name}</p>
                                        <p className="text-sm text-slate-500">NIS: {student.nis}</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                                            <AcademicCapIcon /> <span>{student.class}</span>
                                        </div>
                                         <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold mt-1">
                                            <WalletIcon /> <span>Rp {student.balance.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleEdit(student)} className="text-indigo-600" title="Edit"><EditIcon /></button>
                                        <button onClick={() => handleDelete(student)} className="text-rose-600" title="Hapus"><DeleteIcon /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedStudent ? 'Edit Siswa' : 'Tambah Siswa'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                        id="nis"
                        label="NIS"
                        {...register('nis', { required: 'NIS tidak boleh kosong' })}
                        error={errors.nis?.message}
                    />
                    <FormInput
                        id="name"
                        label="Nama Lengkap"
                        {...register('name', { required: 'Nama tidak boleh kosong' })}
                        error={errors.name?.message}
                    />
                     <FormSelect
                        id="class"
                        label="Kelas"
                        {...register('class', { required: 'Kelas harus dipilih' })}
                        error={errors.class?.message}
                     >
                        <option value="">-- Pilih Kelas --</option>
                        {isLoadingClasses ? <option>Memuat...</option> : classes?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                     </FormSelect>
                    <div className="flex justify-end gap-3 pt-2">
                        <FormButton type="button" variant="secondary" onClick={closeModal}>Batal</FormButton>
                        <FormButton type="submit" disabled={studentMutation.isPending}>{studentMutation.isPending ? 'Menyimpan...' : 'Simpan'}</FormButton>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={onConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Anda yakin ingin menghapus data siswa "${selectedStudent?.name}"? Aksi ini akan menghapus akun login siswa juga dan tidak dapat dibatalkan.`}
                confirmText="Hapus"
                isConfirming={deleteMutation.isPending}
            />

             <Modal isOpen={isImportModalOpen} onClose={handleCloseImportModal} title="Import Data Siswa">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-slate-700">Petunjuk Format</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Upload file CSV dengan header: <strong>nis,name,class</strong>.
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Pastikan nama kelas sesuai dengan yang ada di Manajemen Kelas.
                        </p>
                        <button onClick={downloadTemplate} className="text-sm text-indigo-600 hover:underline mt-2">
                            Unduh File Template
                        </button>
                    </div>
                    
                    <div>
                        <label htmlFor="csv-upload" className="block text-sm font-medium text-slate-700">
                            Pilih File CSV
                        </label>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>

                    {importFile && (
                        <div className="text-sm text-slate-600 bg-slate-100 p-2 rounded-md">
                            File dipilih: <strong>{importFile.name}</strong>
                        </div>
                    )}
                    
                    {importErrors.length > 0 && (
                        <div className="mt-4 p-3 bg-rose-50 rounded-md max-h-40 overflow-y-auto">
                            <h5 className="font-semibold text-rose-700">Detail Kesalahan:</h5>
                            <ul className="list-disc list-inside text-sm text-rose-600 mt-1 space-y-1">
                                {importErrors.map((error, index) => <li key={index}>{error}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <FormButton type="button" variant="secondary" onClick={handleCloseImportModal}>Batal</FormButton>
                        <FormButton type="button" onClick={handleImportSubmit} disabled={!importFile || importMutation.isPending}>
                            {importMutation.isPending ? 'Memproses...' : 'Proses Import'}
                        </FormButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentManagement;