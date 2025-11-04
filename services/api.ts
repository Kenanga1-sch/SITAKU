
import axios from 'axios';
import { User, Student, Saving, StudentDebt, TeacherDebt, DailyDepositSlip, ClassData, SavingType, DailySummary } from '../types';

const apiClient = axios.create({
    baseURL: '/api', // Assuming backend is served from the same origin under /api
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// A helper to handle errors
const handleError = (error: any) => {
    const message = error.response?.data?.message || error.message || 'An unknown error occurred';
    console.error("API Error:", message, error.response);
    throw new Error(message);
};

// Auth
const login = async (credentials: Pick<User, 'username' | 'password'>): Promise<{ token: string, user: User }> => {
    try {
        const { data } = await apiClient.post('/auth/login', credentials);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const getProfile = async (): Promise<User> => {
    try {
        const { data } = await apiClient.get('/auth/profile');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

// Admin Stats
const getAdminStats = async () => {
    try {
        const { data } = await apiClient.get('/stats/admin');
        return data; // { totalUsers, totalStudents, totalClasses }
    } catch (error) {
        return handleError(error);
    }
};

// User Management (Admin)
const getAllUsers = async (): Promise<User[]> => {
    try {
        const { data } = await apiClient.get('/users');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
        const { data } = await apiClient.post('/users', userData);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
    try {
        const { data } = await apiClient.put(`/users/${id}`, userData);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const deleteUser = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/users/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

// Class Management (Admin)
const getAllClasses = async (): Promise<ClassData[]> => {
    try {
        const { data } = await apiClient.get('/classes');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const createClass = async (classData: { name: string }): Promise<ClassData> => {
    try {
        const { data } = await apiClient.post('/classes', classData);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const updateClass = async (id: string, classData: { name: string }): Promise<ClassData> => {
    try {
        const { data } = await apiClient.put(`/classes/${id}`, classData);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const deleteClass = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/classes/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

const getAvailableTeachers = async (): Promise<User[]> => {
    try {
        const { data } = await apiClient.get('/users/teachers/available');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const assignWaliKelas = async (classId: string, waliKelasId: string | null): Promise<ClassData> => {
    try {
        const { data } = await apiClient.post(`/classes/${classId}/assign-teacher`, { waliKelasId });
        return data;
    } catch (error) {
        return handleError(error);
    }
};

// Student Management (Admin)
const getAllStudents = async (): Promise<Student[]> => {
    try {
        const { data } = await apiClient.get('/students');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const createStudent = async (studentData: Omit<Student, 'id' | 'balance' | 'totalDebt'>): Promise<Student> => {
    try {
        const { data } = await apiClient.post('/students', studentData);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const updateStudent = async (id: string, studentData: Partial<Omit<Student, 'id' | 'balance' | 'totalDebt'>>): Promise<Student> => {
    try {
        const { data } = await apiClient.put(`/students/${id}`, studentData);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const deleteStudent = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/students/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

// Guru Actions
const getStudentsByClass = async (className: string): Promise<Student[]> => {
    try {
        const { data } = await apiClient.get(`/guru/students/class/${className}`);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const createSaving = async (savingData: { studentId: string; amount: number; type: SavingType; notes?: string }): Promise<Saving> => {
    try {
        const { data } = await apiClient.post('/savings', savingData);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const getGuruDailySummary = async (): Promise<DailySummary> => {
    try {
        const { data } = await apiClient.get('/guru/summary/daily');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const submitDailyDeposit = async (): Promise<DailyDepositSlip> => {
    try {
        const { data } = await apiClient.post('/guru/deposits/submit');
        return data;
    } catch (error) {
        return handleError(error);
    }
};


// Bendahara Actions
const getPendingDepositSlips = async (): Promise<DailyDepositSlip[]> => {
    try {
        const { data } = await apiClient.get('/bendahara/deposits/pending');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const confirmDepositSlip = async (slipId: string): Promise<DailyDepositSlip> => {
    try {
        const { data } = await apiClient.post(`/bendahara/deposits/${slipId}/confirm`);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const getTeacherDebts = async (): Promise<TeacherDebt[]> => {
    try {
        const { data } = await apiClient.get('/bendahara/debts/teacher');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const createTeacherDebt = async (debtData: Omit<TeacherDebt, 'id' | 'isPaid' | 'createdAt' | 'recordedById'>): Promise<TeacherDebt> => {
    try {
        const { data } = await apiClient.post('/bendahara/debts/teacher', debtData);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const payTeacherDebt = async (debtId: string): Promise<TeacherDebt> => {
    try {
        const { data } = await apiClient.post(`/bendahara/debts/teacher/${debtId}/pay`);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

// Siswa Data
const getStudentById = async (studentId: string): Promise<Student> => {
    try {
        const { data } = await apiClient.get(`/students/${studentId}`);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const getSavingsByStudent = async (studentId: string): Promise<Saving[]> => {
    try {
        const { data } = await apiClient.get(`/students/${studentId}/savings`);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

const getDebtsByStudent = async (studentId: string): Promise<StudentDebt[]> => {
    try {
        const { data } = await apiClient.get(`/students/${studentId}/debts`);
        return data;
    } catch (error) {
        return handleError(error);
    }
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
