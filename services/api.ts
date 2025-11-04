
import { Role, User, Student, Saving, StudentDebt, SavingType, ClassData } from '../types';

// --- MOCK DATABASE ---

const students: Student[] = [
    { id: 's1', nis: '1001', name: 'Ani', class: '10-A', balance: 150000, totalDebt: 20000 },
    { id: 's2', nis: '1002', name: 'Budi', class: '10-A', balance: 250000, totalDebt: 0 },
    { id: 's3', nis: '1003', name: 'Citra', class: '10-B', balance: 50000, totalDebt: 5000 },
];

const users: User[] = [
    { id: 'u1', username: 'admin', role: Role.ADMIN },
    { id: 'u2', username: 'guru_budi', role: Role.GURU, classManaged: '10-A' },
    { id: 'u3', username: 'bendahara_siti', role: Role.BENDAHARA },
    { id: 'u4', username: 'siswa_ani', role: Role.SISWA, studentProfile: students[0] },
];

const savings: Saving[] = [
    { id: 'sv1', studentId: 's1', amount: 50000, type: SavingType.DEPOSIT, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'sv2', studentId: 's1', amount: 20000, type: SavingType.WITHDRAWAL, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'sv3', studentId: 's2', amount: 100000, type: SavingType.DEPOSIT, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
];

const studentDebts: StudentDebt[] = [
    { id: 'd1', studentId: 's1', amount: 20000, notes: 'Beli buku', isPaid: false, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

const classes: ClassData[] = [
    { id: 'c1', name: '10-A', waliKelasId: 'u2', waliKelasName: 'guru_budi', studentCount: 2 },
    { id: 'c2', name: '10-B', waliKelasId: null, waliKelasName: null, studentCount: 1 },
]

// --- MOCK API FUNCTIONS ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
    login: async (username: string): Promise<User | undefined> => {
        await delay(500);
        return users.find(u => u.username === username);
    },

    getSavingsByStudent: async (studentId: string): Promise<Saving[]> => {
        await delay(500);
        return savings.filter(s => s.studentId === studentId);
    },
    
    getDebtsByStudent: async (studentId: string): Promise<StudentDebt[]> => {
        await delay(500);
        return studentDebts.filter(d => d.studentId === studentId);
    },

    getAdminStats: async (): Promise<{ totalUsers: number, totalStudents: number, totalClasses: number }> => {
        await delay(500);
        return {
            totalUsers: users.length,
            totalStudents: students.length,
            totalClasses: classes.length,
        };
    },

    getAllClasses: async (): Promise<ClassData[]> => {
        await delay(500);
        return classes;
    }
};
