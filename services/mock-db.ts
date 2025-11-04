// This file contains the mock database for the application.
import { Role, User, Student, Saving, StudentDebt, TeacherDebt, SavingType } from '../types';

// Define consistent IDs for linking data
const user_admin_id = 'user-1';
const user_guru_a_id = 'user-2';
const user_guru_b_id = 'user-3';
const user_bendahara_id = 'user-4';
const user_siswa_joko_id = 'user-student-student-1';
const user_siswa_ani_id = 'user-student-student-2';
const user_siswa_budi_id = 'user-student-student-3';
const user_siswa_siti_id = 'user-student-student-4';

const class_10a_id = 'class-1';
const class_10b_id = 'class-2';

const student_joko_id = 'student-1';
const student_ani_id = 'student-2';
const student_budi_id = 'student-3';
const student_siti_id = 'student-4';

const users: User[] = [
    { id: user_admin_id, username: 'admin', role: Role.ADMIN },
    { id: user_guru_a_id, username: 'guru_a', role: Role.GURU, classManaged: '10-A' },
    { id: user_guru_b_id, username: 'guru_b', role: Role.GURU, classManaged: '10-B' },
    { id: user_bendahara_id, username: 'bendahara', role: Role.BENDAHARA },
    { id: user_siswa_joko_id, username: 'siswa_joko', role: Role.SISWA },
    { id: user_siswa_ani_id, username: 'siswa_ani', role: Role.SISWA },
    { id: user_siswa_budi_id, username: 'siswa_budi', role: Role.SISWA },
    { id: user_siswa_siti_id, username: 'siswa_siti', role: Role.SISWA },
];

const classes = [
    { id: class_10a_id, name: '10-A', waliKelasId: user_guru_a_id },
    { id: class_10b_id, name: '10-B', waliKelasId: user_guru_b_id },
    { id: 'class-3', name: '11-A', waliKelasId: null },
];

const students: Student[] = [
    { id: student_joko_id, nis: '1001', name: 'Joko', class: '10-A', balance: 150000, totalDebt: 25000 },
    { id: student_ani_id, nis: '1002', name: 'Ani', class: '10-A', balance: 200000, totalDebt: 0 },
    { id: student_budi_id, nis: '1003', name: 'Budi', class: '10-B', balance: 50000, totalDebt: 10000 },
    { id: student_siti_id, nis: '1004', name: 'Siti', class: '10-B', balance: 300000, totalDebt: 0 },
];

const savings: Saving[] = [
    { id: 'saving-1', studentId: student_joko_id, studentName: 'Joko', amount: 50000, type: SavingType.DEPOSIT, notes: 'Setoran awal', createdAt: '2023-10-01T10:00:00Z', createdByName: 'guru_a' },
    { id: 'saving-2', studentId: student_joko_id, studentName: 'Joko', amount: 10000, type: SavingType.WITHDRAWAL, notes: 'Beli buku', createdAt: '2023-10-05T11:00:00Z', createdByName: 'guru_a' },
    { id: 'saving-3', studentId: student_ani_id, studentName: 'Ani', amount: 100000, type: SavingType.DEPOSIT, notes: 'Setoran awal', createdAt: '2023-10-01T10:05:00Z', createdByName: 'guru_a' },
    { id: 'saving-4', studentId: student_budi_id, studentName: 'Budi', amount: 20000, type: SavingType.DEPOSIT, notes: 'Setoran', createdAt: new Date().toISOString(), createdByName: 'guru_b' },
];

const studentDebts: StudentDebt[] = [
    { id: 'sdebt-1', studentId: student_joko_id, studentName: 'Joko', amount: 25000, notes: 'LKS Matematika', isPaid: false, createdAt: '2023-09-15T14:00:00Z', dueDate: null },
    { id: 'sdebt-2', studentId: student_budi_id, studentName: 'Budi', amount: 10000, notes: 'Fotokopi', isPaid: false, createdAt: '2023-09-20T09:00:00Z', dueDate: null },
];

const teacherDebts: TeacherDebt[] = [
    { id: 'tdebt-1', teacherName: 'guru_a', amount: 50000, notes: 'Pinjaman pribadi', isPaid: false, createdAt: '2023-10-02T15:00:00Z', recordedById: user_bendahara_id },
    { id: 'tdebt-2', teacherName: 'guru_b', amount: 100000, notes: 'Kasbon', isPaid: true, createdAt: '2023-09-01T12:00:00Z', recordedById: user_bendahara_id },
];

const dailyDepositSlips: any[] = [
    { id: 'slip-1', class: '10-A', amount: 150000, createdAt: '2023-10-10T16:00:00Z', teacherName: 'guru_a', isConfirmed: true },
    { id: 'slip-2', class: '10-B', amount: 75000, createdAt: '2023-10-11T16:00:00Z', teacherName: 'guru_b', isConfirmed: false },
];

export const MOCK_DB = {
    users,
    classes,
    students,
    savings,
    studentDebts,
    teacherDebts,
    dailyDepositSlips,
};
