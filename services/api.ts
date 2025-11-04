
import { Role, User, Student, Saving, StudentDebt, SavingType, ClassData } from '../types';

// --- MOCK DATABASE ---

let students: Student[] = [
    { id: 's1', nis: '1001', name: 'Ani', class: '10-A', balance: 150000, totalDebt: 20000 },
    { id: 's2', nis: '1002', name: 'Budi', class: '10-A', balance: 250000, totalDebt: 0 },
    { id: 's3', nis: '1003', name: 'Citra', class: '10-B', balance: 50000, totalDebt: 5000 },
];

let users: User[] = [
    { id: 'u1', username: 'admin', role: Role.ADMIN },
    { id: 'u2', username: 'guru_budi', role: Role.GURU, classManaged: '10-A' },
    { id: 'u3', username: 'bendahara_siti', role: Role.BENDAHARA },
    { id: 'u4', username: 'siswa_ani', role: Role.SISWA, studentProfile: students[0] },
    { id: 'u5', username: 'guru_rudi', role: Role.GURU },
];

let savings: Saving[] = [
    { id: 'sv1', studentId: 's1', amount: 50000, type: SavingType.DEPOSIT, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'sv2', studentId: 's1', amount: 20000, type: SavingType.WITHDRAWAL, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'sv3', studentId: 's2', amount: 100000, type: SavingType.DEPOSIT, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
];

let studentDebts: StudentDebt[] = [
    { id: 'd1', studentId: 's1', amount: 20000, notes: 'Beli buku', isPaid: false, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

let classes: ClassData[] = [
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

    getStudentById: async (studentId: string): Promise<Student> => {
        await delay(300);
        const student = students.find(s => s.id === studentId);
        if (!student) throw new Error("Student not found");
        return student;
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
        return classes.map(c => {
            const wali = users.find(u => u.id === c.waliKelasId);
            return { ...c, waliKelasName: wali ? wali.username : null };
        });
    },

    getAvailableTeachers: async (): Promise<User[]> => {
        await delay(500);
        const assignedTeacherIds = new Set(classes.map(c => c.waliKelasId).filter(Boolean));
        return users.filter(u => u.role === Role.GURU && !assignedTeacherIds.has(u.id));
    },

    createClass: async (data: { name: string }): Promise<ClassData> => {
        await delay(500);
        if (classes.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
            throw new Error(`Kelas dengan nama "${data.name}" sudah ada.`);
        }
        const newClass: ClassData = {
            id: `c${Date.now()}`,
            name: data.name,
            studentCount: 0,
            waliKelasId: null,
            waliKelasName: null,
        };
        classes.push(newClass);
        return newClass;
    },

    updateClass: async (id: string, data: { name: string }): Promise<ClassData> => {
        await delay(500);
        const classIndex = classes.findIndex(c => c.id === id);
        if (classIndex === -1) {
            throw new Error("Kelas tidak ditemukan.");
        }
        if (classes.some(c => c.name.toLowerCase() === data.name.toLowerCase() && c.id !== id)) {
            throw new Error(`Kelas dengan nama "${data.name}" sudah ada.`);
        }
        
        const oldName = classes[classIndex].name;
        classes[classIndex] = { ...classes[classIndex], name: data.name };

        // Also update teacher's classManaged if name changes
        if (classes[classIndex].waliKelasId && oldName !== data.name) {
            const teacher = users.find(u => u.id === classes[classIndex].waliKelasId);
            if (teacher) {
                teacher.classManaged = data.name;
            }
        }
        return classes[classIndex];
    },

    assignWaliKelas: async (classId: string, waliKelasId: string | null): Promise<ClassData> => {
        await delay(500);
        const classToUpdate = classes.find(c => c.id === classId);
        if (!classToUpdate) {
            throw new Error("Kelas tidak ditemukan.");
        }

        // Un-assign old teacher from this class
        const oldTeacherId = classToUpdate.waliKelasId;
        if (oldTeacherId) {
            const oldTeacher = users.find(u => u.id === oldTeacherId);
            if (oldTeacher) {
                oldTeacher.classManaged = undefined;
            }
        }

        if (waliKelasId) {
            const newTeacher = users.find(u => u.id === waliKelasId);
            if (!newTeacher || newTeacher.role !== Role.GURU) {
                throw new Error("Guru tidak ditemukan.");
            }
            // Un-assign the new teacher from their previous class if they had one
            const alreadyAssignedClass = classes.find(c => c.waliKelasId === waliKelasId);
            if(alreadyAssignedClass) {
                alreadyAssignedClass.waliKelasId = null;
                alreadyAssignedClass.waliKelasName = null;
            }

            classToUpdate.waliKelasId = newTeacher.id;
            classToUpdate.waliKelasName = newTeacher.username;
            newTeacher.classManaged = classToUpdate.name;
        } else {
            // This is an un-assignment
            classToUpdate.waliKelasId = null;
            classToUpdate.waliKelasName = null;
        }
        
        return classToUpdate;
    },

    deleteClass: async (id: string): Promise<{ id: string }> => {
        await delay(500);
        const classIndex = classes.findIndex(c => c.id === id);
        if (classIndex === -1) {
            throw new Error("Kelas tidak ditemukan.");
        }
        
        const classToDelete = classes[classIndex];
        if (classToDelete.studentCount > 0) {
            throw new Error("Tidak dapat menghapus kelas yang masih memiliki siswa.");
        }

        // Un-assign teacher if any
        if (classToDelete.waliKelasId) {
            const teacher = users.find(u => u.id === classToDelete.waliKelasId);
            if (teacher) {
                teacher.classManaged = undefined;
            }
        }

        classes.splice(classIndex, 1);
        return { id };
    },
};