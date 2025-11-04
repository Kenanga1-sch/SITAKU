// This file defines the core data structures and types used across the frontend application.

export enum Role {
  ADMIN = 'ADMIN',
  GURU = 'GURU',
  BENDAHARA = 'BENDAHARA',
  SISWA = 'SISWA',
}

export interface User {
  id: string;
  username: string;
  role: Role;
  classManaged?: string; // For GURU role
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  balance: number;
  totalDebt: number;
}

export enum SavingType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export interface Saving {
  id: string;
  studentId: string;
  studentName?: string;
  amount: number;
  type: SavingType;
  notes: string | null;
  createdAt: string;
  createdByName?: string;
}

export interface StudentDebt {
  id: string;
  studentId: string;
  studentName?: string;
  amount: number;
  notes: string | null;
  isPaid: boolean;
  createdAt: string;
  dueDate: string | null;
}

export interface TeacherDebt {
  id: string;
  teacherName: string;
  amount: number;
  notes: string | null;
  isPaid: boolean;
  createdAt: string;
  recordedById: string;
}

export interface ClassData {
  id: string;
  name: string;
  waliKelasId: string | null;
  waliKelasName: string | null;
  studentCount: number;
}

export interface DailySummary {
  transactions: Saving[];
  submissionStatus: boolean;
}

export interface DailyDepositSlip {
  id: string;
  class: string;
  amount: number;
  createdAt: string;
  teacherName: string;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// For student transaction page
export interface StudentTransactionData {
  student: Student;
  savings: PaginatedResponse<Saving>;
  debts: PaginatedResponse<StudentDebt>;
}

// For siswa dashboard
export interface SiswaDashboardData {
  student: Student;
  savings: Saving[];
  debts: StudentDebt[];
}
