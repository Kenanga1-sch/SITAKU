
import { 
    User, 
    Role, 
    Student, 
    ClassData, 
    DailySummary,
    SavingType,
    DailyDepositSlip,
    DepositSlipStatus,
    TeacherDebt,
    Saving,
    StudentDebt,
    PaginatedResponse,
    ChartData,
    GlobalStats,
} from '../types';

// =================================================================
// MOCK DATABASE - In a real app, this would be a backend server
// =================================================================
let users: User[] = [
    { id: 'user-1', username: 'admin', role: Role.ADMIN },
    { id: 'user-2', username: 'guru_a', role: Role.GURU, classManaged: '10-A' },
    { id: 'user-3', username: 'guru_b', role: Role.GURU, classManaged: '10-B' },
    { id: 'user-4', username: 'bendahara', role: Role.BENDAHARA },
    { id: 'user-5', username: 'guru_c', role: Role.GURU }, // Guru without class
];

let students: Student[] = [
    { id: 'student-1', nis: '1001', name: 'Joko Susilo', class: '10-A', balance: 150000, totalDebt: 0 },
    { id: 'student-2', nis: '1002', name: 'Siti Aminah', class: '10-A', balance: 250000, totalDebt: 10000 },
    { id: 'student-3', nis: '1003', name: 'Budi Hartono', class: '10-B', balance: 50000, totalDebt: 0 },
];

users.push({ id: 'user-siswa-1', username: 'siswa_joko', role: Role.SISWA, studentProfile: students[0] });

let classes: ClassData[] = [
    { id: 'class-1', name: '10-A', waliKelasId: 'user-2', waliKelasName: 'guru_a', studentCount: 2 },
    { id: 'class-2', name: '10-B', waliKelasId: 'user-3', waliKelasName: 'guru_b', studentCount: 1 },
    { id: 'class-3', name: '10-C', waliKelasId: null, waliKelasName: null, studentCount: 0 },
];

let savings: Saving[] = [
    {id: 'saving-1', studentId: 'student-1', studentName: 'Joko Susilo', amount: 50000, type: SavingType.DEPOSIT, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), createdByName: 'guru_a'},
    {id: 'saving-2', studentId: 'student-1', studentName: 'Joko Susilo', amount: 100000, type: SavingType.DEPOSIT, createdAt: new Date(Date.now() - 86400000).toISOString(), createdByName: 'guru_a'},
];

let studentDebts: StudentDebt[] = [
    {id: 'sdebt-1', studentId: 'student-2', amount: 10000, isPaid: false, notes: 'Beli buku', createdAt: new Date().toISOString(), createdByName: 'guru_a'}
];

let teacherDebts: TeacherDebt[] = [
    {id: 'tdebt-1', teacherName: 'guru_a', amount: 50000, notes: 'Pinjaman pribadi', isPaid: false, createdAt: new Date().toISOString(), recordedById: 'user-4'},
    {id: 'tdebt-2', teacherName: 'guru_b', amount: 25000, notes: 'Kasbon', isPaid: true, createdAt: new Date(Date.now() - 86400000).toISOString(), recordedById: 'user-4'},
];

let depositSlips: DailyDepositSlip[] = [
    {id: 'slip-1', guruId: 'user-3', guruName: 'guru_b', class: '10-B', amount: 75000, status: DepositSlipStatus.PENDING, createdAt: new Date().toISOString()},
];

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =================================================================
// API FUNCTIONS
// =================================================================

// Simple mock token management
const FAKE_TOKEN_PREFIX = 'fake-token-';
let loggedInUserId: string | null = null;

const getCurrentUser = () => users.find(u => u.id === loggedInUserId);

const apiService = {
    // --- Auth ---
    login: async (credentials: { username: string; password?: string }) => {
        await sleep(500);
        const foundUser = users.find(u => u.username === credentials.username);
        // In a real app, password would be checked
        if (foundUser) {
            loggedInUserId = foundUser.id;
            const token = FAKE_TOKEN_PREFIX + foundUser.id;
            localStorage.setItem('token', token);
            return { token, user: foundUser };
        }
        throw new Error('Username atau password salah.');
    },

    getProfile: async () => {
        await sleep(300);
        const token = localStorage.getItem('token');
        if (token && token.startsWith(FAKE_TOKEN_PREFIX)) {
            const userId = token.replace(FAKE_TOKEN_PREFIX, '');
            loggedInUserId = userId;
            const user = users.find(u => u.id === userId);
            if (user) return user;
        }
        throw new Error('Sesi tidak valid.');
    },

    // --- Admin Dashboard ---
    getAdminStats: async () => {
        await sleep(500);
        return {
            totalUsers: users.filter(u => u.role !== Role.SISWA).length,
            totalStudents: students.length,
            totalClasses: classes.length,
        };
    },
    getUserRoleChartData: async (): Promise<ChartData> => {
        await sleep(800);
        const roles = users.reduce((acc, user) => {
            if(user.role !== Role.SISWA) {
                acc[user.role] = (acc[user.role] || 0) + 1;
            }
            return acc;
        }, {} as Record<Role, number>);
        
        return {
            labels: Object.keys(roles),
            values: Object.values(roles),
        }
    },

    // --- User Management (Paginated) ---
    getUsers: async ({ page = 1, limit = 10, search = '' }): Promise<PaginatedResponse<User>> => {
        await sleep(500);
        const filteredUsers = users
            .filter(u => u.role !== Role.SISWA)
            .filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
        
        const total = filteredUsers.length;
        const data = filteredUsers.slice((page - 1) * limit, page * limit);
        
        return { data, total, page, limit };
    },
    createUser: async (userData: any) => {
        await sleep(500);
        if (users.some(u => u.username === userData.username)) {
            throw new Error('Username sudah ada.');
        }
        const newUser: User = { ...userData, id: `user-${Date.now()}` };
        users.push(newUser);
        return newUser;
    },
    updateUser: async (id: string, userData: any) => {
        await sleep(500);
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...userData };
            return users[userIndex];
        }
        throw new Error('User tidak ditemukan.');
    },
    deleteUser: async (id: string) => {
        await sleep(500);
        users = users.filter(u => u.id !== id);
        return { message: 'User berhasil dihapus' };
    },

    // --- Class Management (Paginated) ---
    getClasses: async ({ page = 1, limit = 10 }): Promise<PaginatedResponse<ClassData>> => {
        await sleep(500);
        const total = classes.length;
        const data = classes.slice((page - 1) * limit, page * limit);
        return { data, total, page, limit };
    },
    createClass: async (classData: { name: string }) => {
        await sleep(500);
        if(classes.some(c => c.name === classData.name)) throw new Error('Nama kelas sudah ada.');
        const newClass: ClassData = { ...classData, id: `class-${Date.now()}`, waliKelasId: null, waliKelasName: null, studentCount: 0 };
        classes.push(newClass);
        return newClass;
    },
    updateClass: async (id: string, classData: { name: string }) => {
        await sleep(500);
        const classIndex = classes.findIndex(c => c.id === id);
        if (classIndex > -1) {
            classes[classIndex].name = classData.name;
            return classes[classIndex];
        }
        throw new Error('Kelas tidak ditemukan.');
    },
    deleteClass: async (id: string) => {
        await sleep(500);
        if(students.some(s => s.class === classes.find(c => c.id === id)?.name)) {
            throw new Error('Tidak dapat menghapus kelas yang masih memiliki siswa.');
        }
        classes = classes.filter(c => c.id !== id);
        return { message: 'Kelas berhasil dihapus' };
    },
    getAvailableTeachers: async () => {
        await sleep(400);
        const assignedTeacherIds = classes.map(c => c.waliKelasId);
        return users.filter(u => u.role === Role.GURU && !assignedTeacherIds.includes(u.id));
    },
    assignWaliKelas: async (classId: string, waliKelasId: string | null) => {
        await sleep(500);
        const classToUpdate = classes.find(c => c.id === classId);
        if (!classToUpdate) throw new Error('Kelas tidak ditemukan');
        
        const oldWali = users.find(u => u.id === classToUpdate.waliKelasId);
        if(oldWali) oldWali.classManaged = undefined;

        if (waliKelasId === null || waliKelasId === "") {
            classToUpdate.waliKelasId = null;
            classToUpdate.waliKelasName = null;
        } else {
            const newWali = users.find(u => u.id === waliKelasId);
            if (!newWali || newWali.role !== Role.GURU) throw new Error('Guru tidak ditemukan');
            
            const oldClass = classes.find(c => c.waliKelasId === waliKelasId);
            if(oldClass) {
                oldClass.waliKelasId = null;
                oldClass.waliKelasName = null;
            }

            classToUpdate.waliKelasId = newWali.id;
            classToUpdate.waliKelasName = newWali.username;
            newWali.classManaged = classToUpdate.name;
        }
        return classToUpdate;
    },
    
    // --- Student Management (Paginated) ---
    getStudents: async ({ page = 1, limit = 10, search = '', classFilter = '' }): Promise<PaginatedResponse<Student>> => {
        await sleep(600);
        let filteredStudents = students;

        if (search) {
            filteredStudents = filteredStudents.filter(s => 
                s.name.toLowerCase().includes(search.toLowerCase()) || 
                s.nis.includes(search)
            );
        }
        if (classFilter) {
            filteredStudents = filteredStudents.filter(s => s.class === classFilter);
        }

        const total = filteredStudents.length;
        const data = filteredStudents.slice((page - 1) * limit, page * limit);
        return { data, total, page, limit };
    },
    createStudent: async (studentData: any) => {
        await sleep(500);
        if (students.some(s => s.nis === studentData.nis)) throw new Error('NIS sudah terdaftar.');
        const newStudent: Student = { ...studentData, id: `student-${Date.now()}`, balance: 0, totalDebt: 0 };
        students.push(newStudent);
        
        const studentClass = classes.find(c => c.name === newStudent.class);
        if (studentClass) {
            studentClass.studentCount++;
        }

        return newStudent;
    },
    updateStudent: async (id: string, studentData: any) => {
        await sleep(500);
        const studentIndex = students.findIndex(s => s.id === id);
        if (studentIndex > -1) {
            const oldStudent = students[studentIndex];
            if (oldStudent.class !== studentData.class) {
                const oldClass = classes.find(c => c.name === oldStudent.class);
                if(oldClass) oldClass.studentCount--;
                const newClass = classes.find(c => c.name === studentData.class);
                if(newClass) newClass.studentCount++;
            }
            students[studentIndex] = { ...oldStudent, ...studentData };
            return students[studentIndex];
        }
        throw new Error('Siswa tidak ditemukan.');
    },
    deleteStudent: async (id: string) => {
        await sleep(500);
        const studentToDelete = students.find(s => s.id === id);
        if (studentToDelete) {
            const studentClass = classes.find(c => c.name === studentToDelete.class);
            if (studentClass) {
                studentClass.studentCount--;
            }
        }
        students = students.filter(s => s.id !== id);
        return { message: 'Siswa berhasil dihapus' };
    },
    importStudents: async (data: { nis: string; name: string; class: string }[]) => {
        await sleep(1000);
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];
        data.forEach((s, i) => {
            if (!s.nis || !s.name || !s.class) {
                errorCount++;
                errors.push(`Baris ${i+1}: Data tidak lengkap.`);
            } else if (students.some(st => st.nis === s.nis)) {
                errorCount++;
                errors.push(`Baris ${i+1}: NIS ${s.nis} sudah ada.`);
            } else if (!classes.some(c => c.name === s.class)) {
                errorCount++;
                errors.push(`Baris ${i+1}: Kelas "${s.class}" tidak ditemukan.`);
            } else {
                students.push({ ...s, id: `student-${Date.now()}-${i}`, balance: 0, totalDebt: 0 });
                const studentClass = classes.find(c => c.name === s.class);
                if (studentClass) studentClass.studentCount++;
                successCount++;
            }
        });
        return { successCount, errorCount, errors };
    },
    
    // --- Guru Pages ---
    getStudentsByClass: async (className: string) => {
        await sleep(500);
        return students.filter(s => s.class === className);
    },
    createSaving: async (data: {studentId: string, amount: number, type: SavingType, notes?: string}) => {
        await sleep(400);
        const student = students.find(s => s.id === data.studentId);
        if(!student) throw new Error('Siswa tidak ditemukan');
        if(data.type === SavingType.WITHDRAWAL && student.balance < data.amount) {
            throw new Error('Saldo tidak mencukupi.');
        }
        const currentUser = getCurrentUser();
        const newSaving: Saving = {
            ...data,
            id: `saving-${Date.now()}`,
            createdAt: new Date().toISOString(),
            studentName: student.name,
            createdByName: currentUser?.username ?? 'System'
        };
        savings.push(newSaving);
        student.balance += (data.type === SavingType.DEPOSIT ? data.amount : -data.amount);
        return student; // Return updated student data
    },
    getStudentTransactionHistory: async (studentId: string) => {
        await sleep(400);
        const studentSavings = savings.filter(s => s.studentId === studentId);
        // Can be expanded to include debt payments later
        return studentSavings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
    },
    getGuruDailySummary: async (): Promise<DailySummary> => {
        await sleep(500);
        const guru = getCurrentUser();
        if (!guru || guru.role !== Role.GURU) throw new Error('Akses ditolak');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const classStudents = students.filter(s => s.class === guru.classManaged);
        const studentIds = classStudents.map(s => s.id);

        const transactions = savings.filter(s => {
            const txDate = new Date(s.createdAt);
            return studentIds.includes(s.studentId) && txDate >= today;
        });
        
        const submissionStatus = depositSlips.some(slip => {
            const slipDate = new Date(slip.createdAt);
            return slip.guruId === guru.id && slipDate >= today;
        });

        return { guruId: guru.id, transactions, submissionStatus };
    },
    submitDailyDeposit: async () => {
        await sleep(800);
        const guru = getCurrentUser();
        if (!guru || guru.role !== Role.GURU || !guru.classManaged) throw new Error('Akses ditolak');

        const summary = await apiService.getGuruDailySummary();
        const netAmount = summary.transactions.reduce((acc, tx) => acc + (tx.type === SavingType.DEPOSIT ? tx.amount : -tx.amount), 0);
        
        if (netAmount <= 0) throw new Error('Tidak ada dana untuk disetor.');
        if (summary.submissionStatus) throw new Error('Setoran hari ini sudah diajukan.');
        
        const newSlip: DailyDepositSlip = {
            id: `slip-${Date.now()}`,
            guruId: guru.id,
            guruName: guru.username,
            class: guru.classManaged,
            amount: netAmount,
            status: DepositSlipStatus.PENDING,
            createdAt: new Date().toISOString()
        };
        depositSlips.push(newSlip);
        return newSlip;
    },

    // --- Bendahara Pages ---
    getPendingDepositSlips: async () => {
        await sleep(500);
        return depositSlips.filter(s => s.status === DepositSlipStatus.PENDING);
    },
    confirmDepositSlip: async (slipId: string) => {
        await sleep(600);
        const slip = depositSlips.find(s => s.id === slipId);
        if (slip) {
            slip.status = DepositSlipStatus.CONFIRMED;
            return slip;
        }
        throw new Error('Slip setoran tidak ditemukan.');
    },
    getTeacherDebts: async () => {
        await sleep(500);
        return teacherDebts.sort((a,b) => (a.isPaid === b.isPaid) ? 0 : a.isPaid ? 1 : -1);
    },
    createTeacherDebt: async (data: Omit<TeacherDebt, 'id' | 'isPaid' | 'createdAt' | 'recordedById'>) => {
        await sleep(500);
        if (!loggedInUserId) throw new Error("Unauthorized");
        const newDebt: TeacherDebt = {
            ...data,
            id: `tdebt-${Date.now()}`,
            isPaid: false,
            createdAt: new Date().toISOString(),
            recordedById: loggedInUserId,
        };
        teacherDebts.push(newDebt);
        return newDebt;
    },
    payTeacherDebt: async (debtId: string) => {
        await sleep(500);
        const debt = teacherDebts.find(d => d.id === debtId);
        if (debt) {
            debt.isPaid = true;
            return debt;
        }
        throw new Error('Utang tidak ditemukan.');
    },
    getGlobalStats: async (): Promise<GlobalStats> => {
        await sleep(700);
        return {
            totalBalance: students.reduce((acc, s) => acc + s.balance, 0),
            totalStudentDebt: studentDebts.filter(d => !d.isPaid).reduce((acc, d) => acc + d.amount, 0),
            totalStaffDebt: teacherDebts.filter(d => !d.isPaid).reduce((acc, d) => acc + d.amount, 0),
            totalSavingsToday: 0, // Placeholder
            totalWithdrawalsToday: 0, // Placeholder
        };
    },
    getFinancialSummaryChartData: async (): Promise<ChartData> => {
        await sleep(1000);
        const stats = await apiService.getGlobalStats();
        return {
            labels: ['Total Saldo Siswa', 'Total Utang Siswa', 'Total Utang Staff'],
            values: [stats.totalBalance, stats.totalStudentDebt, stats.totalStaffDebt],
        };
    },
     getAllSavings: async ({ page = 1, limit = 10, startDate = '', endDate = '' }): Promise<PaginatedResponse<Saving>> => {
        await sleep(600);
        let filteredSavings = savings;

        if (startDate) {
            filteredSavings = filteredSavings.filter(s => new Date(s.createdAt) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include whole day
            filteredSavings = filteredSavings.filter(s => new Date(s.createdAt) <= end);
        }

        const sorted = filteredSavings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const total = sorted.length;
        const data = sorted.slice((page - 1) * limit, page * limit);

        return { data, total, page, limit };
    },
    
    // --- Siswa Pages ---
    getStudentById: async (id: string) => {
        await sleep(300);
        const student = students.find(s => s.id === id);
        if (student) return student;
        throw new Error('Siswa tidak ditemukan');
    },
    getSavingsByStudent: async (studentId: string) => {
        await sleep(400);
        return savings.filter(s => s.studentId === studentId);
    },
    getDebtsByStudent: async (studentId: string) => {
        await sleep(400);
        return studentDebts.filter(s => s.studentId === studentId);
    },
};

export const api = apiService;
