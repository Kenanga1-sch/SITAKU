import { Role, User, Student, ClassData, Saving, SavingType, DailySummary, DailyDepositSlip, DepositSlipStatus, TeacherDebt, StudentDebt } from '../types';

// --- MOCK DATABASE ---
// Menggunakan 'let' agar data bisa diubah (mutable)
let mockUsers: User[] = [
    { id: 'user-admin', username: 'admin', role: Role.ADMIN },
    { id: 'user-guru-a', username: 'guru_a', role: Role.GURU, classManaged: '10-A' },
    { id: 'user-guru-b', username: 'guru_b', role: Role.GURU, classManaged: '10-B' },
    { id: 'user-guru-c', username: 'guru_c', role: Role.GURU },
    { id: 'user-bendahara', username: 'bendahara', role: Role.BENDAHARA },
    { id: 'user-siswa-1', username: 'siswa_joko', role: Role.SISWA, studentProfile: { id: 'student-1', nis: '1001', name: 'Joko Susilo', class: '10-A', balance: 50000, totalDebt: 15000 }},
    { id: 'user-siswa-2', username: 'siswa_ani', role: Role.SISWA, studentProfile: { id: 'student-2', nis: '1002', name: 'Ani Widya', class: '10-A', balance: 75000, totalDebt: 0 }},
];

let mockPasswords: Record<string, string> = {
    'user-admin': 'password',
    'user-guru-a': 'password',
    'user-guru-b': 'password',
    'user-guru-c': 'password',
    'user-bendahara': 'password',
    'user-siswa-1': 'password',
    'user-siswa-2': 'password',
};

let mockStudents: Student[] = [
    { id: 'student-1', nis: '1001', name: 'Joko Susilo', class: '10-A', balance: 50000, totalDebt: 15000 },
    { id: 'student-2', nis: '1002', name: 'Ani Widya', class: '10-A', balance: 75000, totalDebt: 0 },
    { id: 'student-3', nis: '1003', name: 'Budi Santoso', class: '10-B', balance: 20000, totalDebt: 0 },
];

let mockClasses: ClassData[] = [
    { id: 'class-1', name: '10-A', waliKelasId: 'user-guru-a', waliKelasName: 'guru_a', studentCount: 2 },
    { id: 'class-2', name: '10-B', waliKelasId: 'user-guru-b', waliKelasName: 'guru_b', studentCount: 1 },
    { id: 'class-3', name: '10-C', waliKelasId: null, waliKelasName: null, studentCount: 0 },
];

let mockSavings: Saving[] = [
    { id: 'saving-1', studentId: 'student-1', amount: 50000, type: SavingType.DEPOSIT, createdAt: new Date().toISOString() },
    { id: 'saving-2', studentId: 'student-2', amount: 75000, type: SavingType.DEPOSIT, createdAt: new Date().toISOString() },
];

let mockStudentDebts: StudentDebt[] = [
     { id: 'sdebt-1', studentId: 'student-1', amount: 15000, notes: 'LKS Matematika', isPaid: false, createdAt: new Date().toISOString() },
];

let mockTeacherDebts: TeacherDebt[] = [
    { id: 'tdebt-1', teacherName: 'Pak Budi (Guru Olahraga)', amount: 100000, notes: 'Pinjaman pribadi', isPaid: false, createdAt: new Date().toISOString(), recordedById: 'user-bendahara' },
];

let mockDepositSlips: DailyDepositSlip[] = [
     { id: 'slip-1', guruId: 'user-guru-b', class: '10-B', amount: 20000, status: DepositSlipStatus.PENDING, createdAt: new Date().toISOString() }
];

// --- API FUNCTIONS ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Auth
// FIX: The User type does not contain a password. Use a specific type for credentials.
const login = async (credentials: { username: string; password: string; }): Promise<{ token: string, user: User }> => {
    await delay(500);
    const user = mockUsers.find(u => u.username === credentials.username);
    if (!user || mockPasswords[user.id] !== credentials.password) {
        throw new Error('Username atau password salah.');
    }
    const token = `mock-token-for-${user.id}`;
    return { token, user };
};

const getProfile = async (): Promise<User> => {
    await delay(300);
    // In a real app, you'd get user ID from token. Here we'll just use the first user of a role for simplicity
    // Let's assume the token is valid for 'user-admin' if no one else is logged in.
    const loggedInUser = mockUsers[0]; // a default, should be replaced by actual login
    return loggedInUser;
};

// ... Rest of the mock functions ...

const getAdminStats = async () => {
    await delay(500);
    return {
        totalUsers: mockUsers.length,
        totalStudents: mockStudents.length,
        totalClasses: mockClasses.length,
    };
};

const getAllUsers = async () => { await delay(300); return mockUsers; };
const createUser = async (userData: any) => {
    await delay(500);
    const newUser: User = { id: generateId('user'), ...userData };
    mockUsers.push(newUser);
    if (userData.password) mockPasswords[newUser.id] = userData.password;
    return newUser;
};
const updateUser = async (id: string, userData: any) => {
    await delay(500);
    mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...userData } : u);
    if (userData.password) mockPasswords[id] = userData.password;
    return mockUsers.find(u => u.id === id)!;
};
const deleteUser = async (id: string) => {
    await delay(500);
    mockUsers = mockUsers.filter(u => u.id !== id);
};

const getAllClasses = async () => { await delay(300); return mockClasses; };
const getAvailableTeachers = async () => {
    await delay(300);
    const assignedTeacherIds = new Set(mockClasses.map(c => c.waliKelasId));
    return mockUsers.filter(u => u.role === Role.GURU && !assignedTeacherIds.has(u.id));
};
const createClass = async (classData: { name: string }) => {
    await delay(500);
    const newClass: ClassData = { id: generateId('class'), studentCount: 0, ...classData };
    mockClasses.push(newClass);
    return newClass;
};
const updateClass = async (id: string, classData: { name: string }) => {
    await delay(500);
    mockClasses = mockClasses.map(c => c.id === id ? { ...c, ...classData } : c);
    return mockClasses.find(c => c.id === id)!;
};
const assignWaliKelas = async (classId: string, waliKelasId: string | null) => {
    await delay(500);
    const teacher = waliKelasId ? mockUsers.find(u => u.id === waliKelasId) : null;
    mockClasses = mockClasses.map(c => {
        // Unassign from other classes if this teacher was assigned elsewhere
        if (c.waliKelasId === waliKelasId && c.id !== classId) {
            return { ...c, waliKelasId: null, waliKelasName: null };
        }
        if (c.id === classId) {
            return { ...c, waliKelasId, waliKelasName: teacher?.username || null };
        }
        return c;
    });
    return mockClasses.find(c => c.id === classId)!;
};
const deleteClass = async (id: string) => {
    await delay(500);
    mockClasses = mockClasses.filter(c => c.id !== id);
};

const getAllStudents = async () => { await delay(300); return mockStudents; };
const getStudentById = async (id: string) => { 
    await delay(100); 
    const student = mockStudents.find(s => s.id === id);
    if (!student) throw new Error("Student not found");
    return student;
};
const getStudentsByClass = async (className: string) => {
    await delay(400);
    return mockStudents.filter(s => s.class === className);
};
const createStudent = async (studentData: any) => {
    await delay(500);
    const newStudent: Student = { id: generateId('student'), balance: 0, totalDebt: 0, ...studentData };
    mockStudents.push(newStudent);
    // Also create a user for the student
    const newUser: User = { id: generateId('user'), username: `siswa_${studentData.name.toLowerCase().split(' ')[0]}`, role: Role.SISWA, studentProfile: newStudent };
    mockUsers.push(newUser);
    mockPasswords[newUser.id] = 'password'; // Default password
    return newStudent;
};
const updateStudent = async (id: string, studentData: any) => {
    await delay(500);
    mockStudents = mockStudents.map(s => s.id === id ? { ...s, ...studentData } : s);
    return mockStudents.find(s => s.id === id)!;
};
const deleteStudent = async (id: string) => {
    await delay(500);
    mockStudents = mockStudents.filter(s => s.id !== id);
};


const getSavingsByStudent = async (studentId: string) => {
    await delay(300);
    return mockSavings.filter(s => s.studentId === studentId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const getDebtsByStudent = async (studentId: string) => {
    await delay(300);
    return mockStudentDebts.filter(d => d.studentId === studentId);
};

const createSaving = async (savingData: any) => {
    await delay(400);
    const newSaving: Saving = { id: generateId('saving'), createdAt: new Date().toISOString(), ...savingData };
    mockSavings.push(newSaving);
    // Update student balance
    mockStudents = mockStudents.map(s => {
        if (s.id === savingData.studentId) {
            const newBalance = savingData.type === SavingType.DEPOSIT ? s.balance + savingData.amount : s.balance - savingData.amount;
            return { ...s, balance: newBalance };
        }
        return s;
    });
    return newSaving;
};

const getGuruDailySummary = async (): Promise<DailySummary> => {
    await delay(500);
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = mockSavings.filter(s => s.createdAt.startsWith(today));
    const hasSubmitted = mockDepositSlips.some(slip => slip.createdAt.startsWith(today) && slip.status !== DepositSlipStatus.PENDING);
    return {
        guruId: 'user-guru-a', // Mocked
        transactions: todaysTransactions,
        submissionStatus: hasSubmitted
    };
};

const submitDailyDeposit = async (): Promise<DailyDepositSlip> => {
    await delay(600);
    const summary = await getGuruDailySummary();
    const totalDeposit = summary.transactions.filter(tx => tx.type === SavingType.DEPOSIT).reduce((acc, tx) => acc + tx.amount, 0);
    const totalWithdrawal = summary.transactions.filter(tx => tx.type === SavingType.WITHDRAWAL).reduce((acc, tx) => acc + tx.amount, 0);
    const netAmount = totalDeposit - totalWithdrawal;
    
    if (netAmount <= 0) throw new Error("Tidak ada dana untuk disetor.");

    const newSlip: DailyDepositSlip = {
        id: generateId('slip'),
        guruId: 'user-guru-a', // Mocked
        class: '10-A', // Mocked
        amount: netAmount,
        status: DepositSlipStatus.PENDING,
        createdAt: new Date().toISOString()
    };
    mockDepositSlips.push(newSlip);
    return newSlip;
};


const getPendingDepositSlips = async () => {
    await delay(400);
    return mockDepositSlips.filter(s => s.status === DepositSlipStatus.PENDING);
};

const confirmDepositSlip = async (slipId: string) => {
    await delay(600);
    mockDepositSlips = mockDepositSlips.map(s => s.id === slipId ? { ...s, status: DepositSlipStatus.CONFIRMED } : s);
    return mockDepositSlips.find(s => s.id === slipId)!;
};

const getTeacherDebts = async () => {
    await delay(400);
    return mockTeacherDebts;
};

const createTeacherDebt = async (debtData: any) => {
    await delay(500);
    const newDebt: TeacherDebt = {
        id: generateId('tdebt'),
        isPaid: false,
        createdAt: new Date().toISOString(),
        recordedById: 'user-bendahara', // Mocked
        ...debtData
    };
    mockTeacherDebts.push(newDebt);
    return newDebt;
};

const payTeacherDebt = async (debtId: string) => {
    await delay(500);
    mockTeacherDebts = mockTeacherDebts.map(d => d.id === debtId ? { ...d, isPaid: true } : d);
    return mockTeacherDebts.find(d => d.id === debtId)!;
};

export const api = {
    login,
    getProfile,
    getAdminStats,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAllClasses,
    createClass,
    updateClass,
    deleteClass,
    getAvailableTeachers,
    assignWaliKelas,
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    createSaving,
    getGuruDailySummary,
    submitDailyDeposit,
    getPendingDepositSlips,
    confirmDepositSlip,
    getTeacherDebts,
    createTeacherDebt,
    payTeacherDebt,
    getStudentById,
    getSavingsByStudent,
    getDebtsByStudent
};
