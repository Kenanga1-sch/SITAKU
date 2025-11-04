// This file mocks a REST API for the application.
// In a real application, this would be replaced with actual HTTP calls to a backend server.
import {
  User,
  Role,
  Student,
  ClassData,
  TeacherDebt,
  DailyDepositSlip,
  PaginatedResponse,
  SiswaDashboardData,
  StudentTransactionData,
  SavingType,
} from '../types';
import { MOCK_DB } from './mock-db';

const FAKE_LATENCY = 500;

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for pagination
const paginate = <T>(items: T[], page: number, limit: number): PaginatedResponse<T> => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / limit);
  return {
    data: paginatedItems,
    total: items.length,
    page,
    limit,
    totalPages,
  };
};

// Mock authentication logic
let currentUser: User | null = null;

const api = {
  // AUTH
  login: async (credentials: { username: string; password: string }) => {
    await sleep(FAKE_LATENCY);
    const user = MOCK_DB.users.find(u => u.username === credentials.username);
    if (user && credentials.password === 'password') {
      const token = `fake-token-for-${user.id}`;
      currentUser = user;
      localStorage.setItem('token', token);
      return { token, user };
    }
    throw new Error('Username atau password salah.');
  },

  getProfile: async () => {
    await sleep(FAKE_LATENCY / 2);
    const token = localStorage.getItem('token');
    if (token) {
        const userId = token.replace('fake-token-for-', '');
        const user = MOCK_DB.users.find(u => u.id === userId);
        if (user) {
            currentUser = user;
            return user;
        }
    }
    throw new Error('Not authenticated');
  },
  
  // STATS & CHARTS
  getAdminStats: async () => {
    await sleep(FAKE_LATENCY);
    return {
      totalUsers: MOCK_DB.users.length,
      totalStudents: MOCK_DB.students.length,
      totalClasses: MOCK_DB.classes.length,
    };
  },

  getUserRoleChartData: async () => {
    await sleep(FAKE_LATENCY);
    const roles = MOCK_DB.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<Role, number>);
    return {
        labels: Object.keys(roles),
        values: Object.values(roles),
    };
  },
  
  getGlobalStats: async () => {
    await sleep(FAKE_LATENCY);
    return {
        totalBalance: MOCK_DB.students.reduce((sum, s) => sum + s.balance, 0),
        totalStudentDebt: MOCK_DB.students.reduce((sum, s) => sum + s.totalDebt, 0),
        totalStaffDebt: MOCK_DB.teacherDebts.filter(d => !d.isPaid).reduce((sum, d) => sum + d.amount, 0),
    };
  },

  getFinancialSummaryChartData: async () => {
      await sleep(FAKE_LATENCY);
      const stats = await api.getGlobalStats();
      return {
          labels: ['Saldo Siswa', 'Utang Siswa', 'Utang Staff'],
          values: [stats.totalBalance, stats.totalStudentDebt, stats.totalStaffDebt],
      };
  },

  // USERS
  getUsers: async ({ page = 1, limit = 10, search = '' }) => {
      await sleep(FAKE_LATENCY);
      const filtered = MOCK_DB.users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
      return paginate(filtered, page, limit);
  },

  createUser: async (data: Omit<User, 'id'>) => {
    await sleep(FAKE_LATENCY);
    if (MOCK_DB.users.some(u => u.username === data.username)) {
      throw new Error('Username sudah ada.');
    }
    const newUser: User = { id: `user-${Date.now()}`, ...data };
    MOCK_DB.users.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    await sleep(FAKE_LATENCY);
    const index = MOCK_DB.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    MOCK_DB.users[index] = { ...MOCK_DB.users[index], ...data };
    return MOCK_DB.users[index];
  },
  
  deleteUser: async (id: string) => {
    await sleep(FAKE_LATENCY);
    MOCK_DB.users = MOCK_DB.users.filter(u => u.id !== id);
    return { success: true };
  },

  // CLASSES
  getClasses: async ({ page = 1, limit = 10 }) => {
    await sleep(FAKE_LATENCY);
    const data: ClassData[] = MOCK_DB.classes.map(c => ({
        ...c,
        waliKelasName: MOCK_DB.users.find(u => u.id === c.waliKelasId)?.username || null,
        studentCount: MOCK_DB.students.filter(s => s.class === c.name).length
    }));
    return paginate(data, page, limit);
  },

  getAvailableTeachers: async () => {
      await sleep(FAKE_LATENCY);
      const assignedTeacherIds = MOCK_DB.classes.map(c => c.waliKelasId).filter(Boolean);
      return MOCK_DB.users.filter(u => u.role === Role.GURU && !assignedTeacherIds.includes(u.id));
  },
  
  createClass: async (data: { name: string }) => {
    await sleep(FAKE_LATENCY);
    const newClass: ClassData = { id: `class-${Date.now()}`, name: data.name, waliKelasId: null, waliKelasName: null, studentCount: 0 };
    MOCK_DB.classes.push(newClass);
    return newClass;
  },

  updateClass: async (id: string, data: { name: string }) => {
      await sleep(FAKE_LATENCY);
      const index = MOCK_DB.classes.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Class not found');
      MOCK_DB.classes[index].name = data.name;
      return MOCK_DB.classes[index];
  },

  assignWaliKelas: async (classId: string, waliKelasId: string | null) => {
    await sleep(FAKE_LATENCY);
    const cls = MOCK_DB.classes.find(c => c.id === classId);
    const teacher = MOCK_DB.users.find(u => u.id === waliKelasId);
    if (!cls) throw new Error('Class not found');

    // Unassign previous teacher if any
    if(cls.waliKelasId) {
        const prevTeacher = MOCK_DB.users.find(u => u.id === cls.waliKelasId);
        if(prevTeacher) prevTeacher.classManaged = undefined;
    }
    
    cls.waliKelasId = waliKelasId;
    if(teacher) teacher.classManaged = cls.name;
    return cls;
  },

  deleteClass: async (id: string) => {
    await sleep(FAKE_LATENCY);
    MOCK_DB.classes = MOCK_DB.classes.filter(c => c.id !== id);
    return { success: true };
  },

  // STUDENTS
  getStudents: async ({ page = 1, limit = 10, search = '', classFilter = '' }) => {
    await sleep(FAKE_LATENCY);
    let filtered = MOCK_DB.students;
    if (search) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search));
    }
    if (classFilter) {
        filtered = filtered.filter(s => s.class === classFilter);
    }
    return paginate(filtered, page, limit);
  },
  
  createStudent: async (data: Omit<Student, 'id' | 'balance' | 'totalDebt'>) => {
    await sleep(FAKE_LATENCY);
    const newStudent: Student = { id: `student-${Date.now()}`, balance: 0, totalDebt: 0, ...data };
    MOCK_DB.students.push(newStudent);
    // Create a login for the student
    const studentUser: User = { id: `user-student-${newStudent.id}`, username: `siswa_${newStudent.name.split(' ')[0].toLowerCase()}`, role: Role.SISWA };
    MOCK_DB.users.push(studentUser);
    return newStudent;
  },

  updateStudent: async (id: string, data: Partial<Student>) => {
      await sleep(FAKE_LATENCY);
      const index = MOCK_DB.students.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Student not found');
      MOCK_DB.students[index] = { ...MOCK_DB.students[index], ...data };
      return MOCK_DB.students[index];
  },

  deleteStudent: async (id: string) => {
      await sleep(FAKE_LATENCY);
      MOCK_DB.students = MOCK_DB.students.filter(s => s.id !== id);
      // Also delete the student's user account
      MOCK_DB.users = MOCK_DB.users.filter(u => u.id !== `user-student-${id}`);
      return { success: true };
  },
  
  importStudents: async (data: { nis: string, name: string, class: string }[]) => {
      await sleep(FAKE_LATENCY * 2);
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      for (const item of data) {
          try {
              await api.createStudent(item);
              successCount++;
          } catch(e) {
              errorCount++;
              errors.push(`Gagal impor ${item.name}: ${(e as Error).message}`);
          }
      }
      return { successCount, errorCount, errors };
  },

  getStudentsByClass: async (className: string) => {
      await sleep(FAKE_LATENCY);
      return MOCK_DB.students.filter(s => s.class === className);
  },

  // TRANSACTIONS (GURU)
  getGuruDailySummary: async () => {
    await sleep(FAKE_LATENCY);
    if (!currentUser || currentUser.role !== Role.GURU) throw new Error("Unauthorized");
    const today = new Date().toISOString().split('T')[0];
    const transactions = MOCK_DB.savings.filter(s => 
        s.createdByName === currentUser!.username && 
        s.createdAt.startsWith(today)
    );
    const submissionStatus = MOCK_DB.dailyDepositSlips.some(slip => slip.teacherName === currentUser!.username && slip.createdAt.startsWith(today));
    return { transactions, submissionStatus };
  },
  
  submitDailyDeposit: async () => {
    await sleep(FAKE_LATENCY);
    if (!currentUser || currentUser.role !== Role.GURU) throw new Error("Unauthorized");
    const summary = await api.getGuruDailySummary();
    const totalDeposit = summary.transactions.filter(tx => tx.type === 'DEPOSIT').reduce((acc, tx) => acc + tx.amount, 0);
    const totalWithdrawal = summary.transactions.filter(tx => tx.type === 'WITHDRAWAL').reduce((acc, tx) => acc + tx.amount, 0);
    const netAmount = totalDeposit - totalWithdrawal;

    if (netAmount <= 0) {
        throw new Error("Tidak ada dana untuk disetor.");
    }
    if (summary.submissionStatus) {
        throw new Error("Setoran hari ini sudah diajukan.");
    }
    const newSlip: DailyDepositSlip = {
        id: `slip-${Date.now()}`,
        class: currentUser.classManaged!,
        amount: netAmount,
        createdAt: new Date().toISOString(),
        teacherName: currentUser.username,
    };
    MOCK_DB.dailyDepositSlips.push(newSlip);
    return newSlip;
  },

  // TRANSACTIONS (BENDAHARA)
  getPendingDepositSlips: async () => {
      await sleep(FAKE_LATENCY);
      return MOCK_DB.dailyDepositSlips.filter(s => !s.isConfirmed);
  },

  confirmDepositSlip: async (slipId: string) => {
      await sleep(FAKE_LATENCY);
      const slip = MOCK_DB.dailyDepositSlips.find(s => s.id === slipId);
      if (!slip) throw new Error("Slip setoran tidak ditemukan.");
      slip.isConfirmed = true;
      return { success: true };
  },
  
  getTeacherDebts: async () => {
      await sleep(FAKE_LATENCY);
      return MOCK_DB.teacherDebts.sort((a,b) => (a.isPaid === b.isPaid) ? 0 : a.isPaid ? 1 : -1);
  },

  createTeacherDebt: async (data: Omit<TeacherDebt, 'id' | 'isPaid' | 'createdAt' | 'recordedById'>) => {
    await sleep(FAKE_LATENCY);
    const newDebt: TeacherDebt = {
        id: `td-${Date.now()}`,
        isPaid: false,
        createdAt: new Date().toISOString(),
        recordedById: currentUser!.id,
        ...data,
    };
    MOCK_DB.teacherDebts.push(newDebt);
    return newDebt;
  },

  payTeacherDebt: async (debtId: string) => {
      await sleep(FAKE_LATENCY);
      const debt = MOCK_DB.teacherDebts.find(d => d.id === debtId);
      if (!debt) throw new Error("Utang tidak ditemukan.");
      debt.isPaid = true;
      return { success: true };
  },

  // REPORTS
  getAllSavings: async ({ page = 1, limit = 15, startDate, endDate }) => {
    await sleep(FAKE_LATENCY);
    let savings = [...MOCK_DB.savings];
    if (startDate) {
        savings = savings.filter(s => new Date(s.createdAt) >= new Date(startDate));
    }
    if (endDate) {
        savings = savings.filter(s => new Date(s.createdAt) <= new Date(endDate));
    }
    savings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(savings, page, limit);
  },

  // STUDENT-SPECIFIC TRANSACTIONS
  getStudentTransactions: async (studentId: string): Promise<StudentTransactionData> => {
    await sleep(FAKE_LATENCY);
    const student = MOCK_DB.students.find(s => s.id === studentId);
    if (!student) throw new Error("Siswa tidak ditemukan.");
    const savings = MOCK_DB.savings.filter(s => s.studentId === studentId);
    const debts = MOCK_DB.studentDebts.filter(d => d.studentId === studentId);
    return {
        student,
        savings: paginate(savings, 1, 100), // Assuming we show all for now
        debts: paginate(debts, 1, 100),
    };
  },

  createSaving: async (studentId: string, data: { amount: number, type: SavingType, notes?: string }) => {
    await sleep(FAKE_LATENCY);
    const student = MOCK_DB.students.find(s => s.id === studentId);
    if (!student) throw new Error("Siswa tidak ditemukan.");
    if (data.type === SavingType.WITHDRAWAL && data.amount > student.balance) {
        throw new Error("Saldo tidak mencukupi.");
    }
    
    const amount = data.type === SavingType.DEPOSIT ? data.amount : -data.amount;
    student.balance += amount;

    const newSaving = {
        id: `saving-${Date.now()}`,
        studentId,
        studentName: student.name,
        amount: data.amount,
        type: data.type,
        notes: data.notes || null,
        createdAt: new Date().toISOString(),
        createdByName: currentUser?.username || 'System',
    };
    MOCK_DB.savings.push(newSaving);
    return newSaving;
  },

  createStudentDebt: async (studentId: string, data: { amount: number, notes?: string }) => {
      await sleep(FAKE_LATENCY);
      const student = MOCK_DB.students.find(s => s.id === studentId);
      if (!student) throw new Error("Siswa tidak ditemukan.");
      student.totalDebt += data.amount;
      const newDebt = {
          id: `sdebt-${Date.now()}`,
          studentId,
          studentName: student.name,
          amount: data.amount,
          notes: data.notes || null,
          isPaid: false,
          createdAt: new Date().toISOString(),
          dueDate: null,
      };
      MOCK_DB.studentDebts.push(newDebt);
      return newDebt;
  },

  payStudentDebt: async (debtId: string) => {
    await sleep(FAKE_LATENCY);
    const debt = MOCK_DB.studentDebts.find(d => d.id === debtId);
    if (!debt) throw new Error("Utang tidak ditemukan.");
    const student = MOCK_DB.students.find(s => s.id === debt.studentId);
    if (!student) throw new Error("Siswa terkait utang tidak ditemukan.");

    if (student.balance < debt.amount) {
        throw new Error("Saldo tidak cukup untuk membayar utang.");
    }

    student.balance -= debt.amount;
    student.totalDebt -= debt.amount;
    debt.isPaid = true;
    
    // Create a corresponding withdrawal saving record
    await api.createSaving(student.id, {
        amount: debt.amount,
        type: SavingType.WITHDRAWAL,
        notes: `Pembayaran utang: ${debt.notes || ''}`
    });

    return { success: true };
  },
  
  // SISWA DASHBOARD
  getSiswaDashboardData: async (): Promise<SiswaDashboardData> => {
      await sleep(FAKE_LATENCY);
      if (!currentUser || currentUser.role !== Role.SISWA) throw new Error("Unauthorized");
      
      const studentUsername = currentUser.username;
      // In mock db, student username is like 'siswa_joko' and student name is 'Joko'. A bit fragile but ok for mock.
      const studentName = studentUsername.split('_')[1];
      const student = MOCK_DB.students.find(s => s.name.toLowerCase().includes(studentName));
      
      if (!student) throw new Error("Data siswa tidak ditemukan.");
      
      const savings = MOCK_DB.savings.filter(s => s.studentId === student.id);
      const debts = MOCK_DB.studentDebts.filter(d => d.studentId === student.id);

      return { student, savings, debts };
  },
};

export { api };
