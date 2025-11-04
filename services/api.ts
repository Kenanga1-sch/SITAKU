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
    { id: 'saving-1', studentId: 'student-1', amount: 50000, type: SavingType.DEPOSIT, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() }, // 2 days ago
    { id: 'saving-2', studentId: 'student-2', amount: 75000, type: SavingType.DEPOSIT, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() }, // 1 day ago
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
const login = async (credentials: { username: string; password: string; }): Promise<{ token: string, user: User }> => {
    await delay(500);
    const user = mockUsers.find(u => u.username === credentials.username);
    if (!user || mockPasswords[user.id] !== credentials.password) {
        throw new Error('Username atau password salah.');
    }
    const token = `mock-token-for-${user.id}`;
    localStorage.setItem('loggedInUserId', user.id);
    return { token, user };
};

const getProfile = async (): Promise<User> => {
    await delay(300);
    const userId = localStorage.getItem('loggedInUserId');
    if(!userId) throw new Error("Not authenticated");
    const user = mockUsers.find(u => u.id === userId);
    if(!user) throw new Error("User not found");
    return user;
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

const getAllUsers = async () => { await delay(300); return [...mockUsers]; };
const createUser = async (userData: Pick<User, 'username' | 'role'> & { password?: string }) => {
    await delay(500);
    if (mockUsers.some(u => u.username === userData.username)) {
        throw new Error(`Username "${userData.username}" sudah digunakan.`);
    }
    const newUser: User = { id: generateId('user'), ...userData };
    mockUsers.push(newUser);
    if (userData.password) mockPasswords[newUser.id] = userData.password;
    return newUser;
};
const updateUser = async (id: string, userData: Partial<User> & { password?: string }) => {
    await delay(500);
    let userToUpdate: User | undefined;
    mockUsers = mockUsers.map(u => {
        if (u.id === id) {
            userToUpdate = { ...u, ...userData };
            return userToUpdate;
        }
        return u;
    });
    if (userData.password) mockPasswords[id] = userData.password;
    if (!userToUpdate) throw new Error("User not found");
    return userToUpdate;
};

const deleteUser = async (id: string) => {
    await delay(500);
    const userToDelete = mockUsers.find(u => u.id === id);
    if (!userToDelete) return;

    // If user is a teacher, unassign from class
    if (userToDelete.role === Role.GURU) {
        mockClasses = mockClasses.map(c => c.waliKelasId === id ? { ...c, waliKelasId: null, waliKelasName: null } : c);
    }
    
    // If user is a student, delete student record
    if (userToDelete.role === Role.SISWA && userToDelete.studentProfile) {
        await deleteStudent(userToDelete.studentProfile.id);
    }

    mockUsers = mockUsers.filter(u => u.id !== id);
    delete mockPasswords[id];
};

const getAllClasses = async () => { 
    await delay(300); 
    // Recalculate student counts to ensure data integrity
    return mockClasses.map(c => ({
        ...c,
        studentCount: mockStudents.filter(s => s.class === c.name).length
    }));
};
const getAvailableTeachers = async () => {
    await delay(300);
    const assignedTeacherIds = new Set(mockClasses.map(c => c.waliKelasId));
    return mockUsers.filter(u => u.role === Role.GURU && !assignedTeacherIds.has(u.id));
};
const createClass = async (classData: { name: string }) => {
    await delay(500);
    if (mockClasses.some(c => c.name === classData.name)) {
        throw new Error(`Kelas "${classData.name}" sudah ada.`);
    }
    const newClass: ClassData = { id: generateId('class'), studentCount: 0, waliKelasId: null, waliKelasName: null, ...classData };
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

    // Unassign this teacher from any other class first
    mockUsers = mockUsers.map(u => u.id === waliKelasId ? { ...u, classManaged: teacher ? mockClasses.find(c => c.id === classId)?.name : undefined } : u);
    
    mockClasses = mockClasses.map(c => {
        // Unassign from other classes if this teacher was assigned elsewhere
        if (c.waliKelasId === waliKelasId && c.id !== classId) {
            return { ...c, waliKelasId: null, waliKelasName: null };
        }
        // Assign to the target class
        if (c.id === classId) {
            return { ...c, waliKelasId, waliKelasName: teacher?.username || null };
        }
        return c;
    });
    return mockClasses.find(c => c.id === classId)!;
};
const deleteClass = async (id: string) => {
    await delay(500);
    const classToDelete = mockClasses.find(c => c.id === id);
    if (!classToDelete) return;
    if (classToDelete.studentCount > 0) {
        throw new Error("Tidak dapat menghapus kelas yang masih memiliki siswa.");
    }
    if (classToDelete.waliKelasId) {
        mockUsers = mockUsers.map(u => u.id === classToDelete.waliKelasId ? { ...u, classManaged: undefined } : u);
    }
    mockClasses = mockClasses.filter(c => c.id !== id);
};

const getAllStudents = async () => { await delay(300); return [...mockStudents]; };
const getStudentById = async (id: string) => { 
    await delay(100); 
    const student = mockStudents.find(s => s.id === id);
    if (!student) throw new Error("Student not found");
    return {...student};
};
const getStudentsByClass = async (className: string) => {
    await delay(400);
    return mockStudents.filter(s => s.class === className);
};
const createStudent = async (studentData: Pick<Student, 'nis'|'name'|'class'>) => {
    await delay(500);
    const newStudent: Student = { id: generateId('student'), balance: 0, totalDebt: 0, ...studentData };
    mockStudents.push(newStudent);
    
    // Also create a user for the student
    const username = `siswa_${studentData.name.toLowerCase().split(' ')[0]}${Math.floor(Math.random()*100)}`;
    const newUser: User = { id: generateId('user'), username, role: Role.SISWA, studentProfile: newStudent };
    mockUsers.push(newUser);
    mockPasswords[newUser.id] = 'password'; // Default password
    return newStudent;
};
const updateStudent = async (id: string, studentData: Partial<Student>) => {
    await delay(500);
    mockStudents = mockStudents.map(s => s.id === id ? { ...s, ...studentData } : s);
    return mockStudents.find(s => s.id === id)!;
};
const deleteStudent = async (id: string) => {
    await delay(500);
    // Also delete student's user account
    const studentUser = mockUsers.find(u => u.studentProfile?.id === id);
    if (studentUser) {
        mockUsers = mockUsers.filter(u => u.id !== studentUser.id);
        delete mockPasswords[studentUser.id];
    }
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

const createSaving = async (savingData: Omit<Saving, 'id'|'createdAt'>) => {
    await delay(400);
    
    const student = mockStudents.find(s => s.id === savingData.studentId);
    if (!student) throw new Error("Siswa tidak ditemukan");
    if (savingData.type === SavingType.WITHDRAWAL && student.balance < savingData.amount) {
        throw new Error("Saldo tidak mencukupi untuk penarikan.");
    }

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
    // Update student profile in user object
     mockUsers = mockUsers.map(u => {
        if (u.studentProfile?.id === savingData.studentId) {
            const studentToUpdate = mockStudents.find(s => s.id === savingData.studentId);
            return { ...u, studentProfile: studentToUpdate };
        }
        return u;
    });
    return newSaving;
};

const getGuruDailySummary = async (): Promise<DailySummary> => {
    await delay(500);
    const guruId = localStorage.getItem('loggedInUserId');
    if (!guruId) throw new Error("User not found");

    const today = new Date().toISOString().split('T')[0];
    // In a real app, we'd filter by guruId on the backend. Here we simulate.
    const todaysTransactions = mockSavings.filter(s => s.createdAt.startsWith(today));
    const hasSubmitted = mockDepositSlips.some(slip => slip.createdAt.startsWith(today) && slip.guruId === guruId);

    return {
        guruId: guruId,
        transactions: todaysTransactions,
        submissionStatus: hasSubmitted
    };
};

const submitDailyDeposit = async (): Promise<DailyDepositSlip> => {
    await delay(600);
    const guruId = localStorage.getItem('loggedInUserId');
    const guru = mockUsers.find(u => u.id === guruId);
    if (!guru || guru.role !== Role.GURU) throw new Error("Invalid user");

    const summary = await getGuruDailySummary();
    const totalDeposit = summary.transactions.filter(tx => tx.type === SavingType.DEPOSIT).reduce((acc, tx) => acc + tx.amount, 0);
    const totalWithdrawal = summary.transactions.filter(tx => tx.type === SavingType.WITHDRAWAL).reduce((acc, tx) => acc + tx.amount, 0);
    const netAmount = totalDeposit - totalWithdrawal;
    
    if (netAmount <= 0) throw new Error("Tidak ada dana untuk disetor.");

    const newSlip: DailyDepositSlip = {
        id: generateId('slip'),
        guruId: guru.id,
        class: guru.classManaged || 'Unknown',
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

const createTeacherDebt = async (debtData: Omit<TeacherDebt, 'id'|'isPaid'|'createdAt'|'recordedById'>) => {
    await delay(500);
    const recorderId = localStorage.getItem('loggedInUserId');
    if (!recorderId) throw new Error("User not found");
    const newDebt: TeacherDebt = {
        id: generateId('tdebt'),
        isPaid: false,
        createdAt: new Date().toISOString(),
        recordedById: recorderId,
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

const importStudents = async (studentsData: { nis: string; name: string; class: string }[]): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
    await delay(1000); // Simulate network and processing time
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const [index, studentData] of studentsData.entries()) {
        const rowNum = index + 2; // Assuming CSV has a header row
        // Validation
        if (!studentData.nis || !studentData.name || !studentData.class) {
            errors.push(`Baris ${rowNum}: Data tidak lengkap.`);
            errorCount++;
            continue;
        }
        if (mockStudents.some(s => s.nis === studentData.nis)) {
            errors.push(`Baris ${rowNum}: NIS "${studentData.nis}" sudah ada.`);
            errorCount++;
            continue;
        }
        if (!mockClasses.some(c => c.name === studentData.class)) {
            errors.push(`Baris ${rowNum}: Kelas "${studentData.class}" tidak ditemukan.`);
            errorCount++;
            continue;
        }
        
        // If valid, create student and user
        try {
            // Re-using createStudent logic, but simplified for bulk action
            const newStudent: Student = { id: generateId('student'), balance: 0, totalDebt: 0, ...studentData };
            mockStudents.push(newStudent);
            
            const username = `siswa_${studentData.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/gi, '')}${Math.floor(Math.random()*100)}`;
            const newUser: User = { id: generateId('user'), username, role: Role.SISWA, studentProfile: newStudent };
            mockUsers.push(newUser);
            mockPasswords[newUser.id] = 'password';
            
            successCount++;
        } catch (e) {
            errors.push(`Baris ${rowNum}: Terjadi kesalahan internal saat membuat siswa "${studentData.name}".`);
            errorCount++;
        }
    }
    
    return { successCount, errorCount, errors };
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
    getDebtsByStudent,
    importStudents,
};