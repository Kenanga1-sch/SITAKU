
export enum Role {
  ADMIN = 'ADMIN',
  GURU = 'GURU',
  BENDAHARA = 'BENDAHARA',
  SISWA = 'SISWA'
}

export enum SavingType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL'
}

export enum DepositSlipStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED'
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}


export interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  balance: number;
  totalDebt: number;
}

export interface User {
  id: string;
  username: string;
  role: Role;
  classManaged?: string; // For GURU role
  studentProfile?: Student; // For SISWA role
}

export interface Saving {
  id: string;
  studentId: string;
  studentName?: string; // For reports
  amount: number;
  type: SavingType;
  notes?: string;
  createdAt: string; // ISO date string
  createdByName?: string; // For audit trail
}

export interface StudentDebt {
  id: string;
  studentId: string;
  amount: number;
  notes?: string;
  isPaid: boolean;
  createdAt: string; // ISO date string
  dueDate?: string; // ISO date string
  createdByName?: string; // For audit trail
}

export interface TeacherDebt {
  id: string;
  teacherName: string;
  amount: number;
  notes?: string;
  isPaid: boolean;
  createdAt: string; // ISO date string
  recordedById: string;
}

export interface DailyDepositSlip {
    id: string;
    guruId: string;
    guruName?: string;
    class: string;
    amount: number;
    status: DepositSlipStatus;
    createdAt: string; // ISO date string
}

export interface DailySummary {
    guruId: string;
    transactions: Saving[];
    submissionStatus: boolean;
}

export interface ClassData {
    id: string;
    name: string;
    waliKelasId?: string | null;
    waliKelasName?: string | null;
    studentCount: number;
}

export interface ChartData {
    labels: string[];
    values: number[];
}

export interface GlobalStats {
    totalBalance: number;
    totalStudentDebt: number;
    totalStaffDebt: number;
    totalSavingsToday: number;
    totalWithdrawalsToday: number;
}
