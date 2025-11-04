
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { Role } from './types';

import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ClassManagement from './pages/admin/ClassManagement';
import StudentManagement from './pages/admin/StudentManagement';
import GuruDashboard from './pages/guru/GuruDashboard';
import StudentTransactions from './pages/guru/StudentTransactions';
import DailyDeposit from './pages/guru/DailyDeposit';
import BendaharaDashboard from './pages/bendahara/BendaharaDashboard';
import DepositConfirmation from './pages/bendahara/DepositConfirmation';
import StaffDebt from './pages/bendahara/StaffDebt';
import SiswaDashboard from './pages/siswa/SiswaDashboard';

const App: React.FC = () => {
    return (
        <UIProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Main />
                    <Toaster position="top-center" reverseOrder={false} />
                </AuthProvider>
            </BrowserRouter>
        </UIProvider>
    );
};

const Main: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/*" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />} />
        </Routes>
    );
}

const AppLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <AppRoutes />
                </main>
            </div>
        </div>
    );
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    const getDashboardRoute = () => {
        if (!user) return <Navigate to="/login" />;
        switch (user.role) {
            case Role.ADMIN: return <Navigate to="/admin/dashboard" />;
            case Role.GURU: return <Navigate to="/guru/dashboard" />;
            case Role.BENDAHARA: return <Navigate to="/bendahara/dashboard" />;
            case Role.SISWA: return <Navigate to="/siswa/dashboard" />;
            default: return <Navigate to="/login" />;
        }
    };

    return (
        <Routes>
            <Route path="/" element={getDashboardRoute()} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={[Role.ADMIN]} />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="classes" element={<ClassManagement />} />
                <Route path="students" element={<StudentManagement />} />
            </Route>
            
            {/* Guru Routes */}
            <Route path="/guru" element={<ProtectedRoute roles={[Role.GURU]} />}>
                <Route path="dashboard" element={<GuruDashboard />} />
                <Route path="transactions" element={<StudentTransactions />} />
                <Route path="deposit" element={<DailyDeposit />} />
            </Route>

            {/* Bendahara Routes */}
            <Route path="/bendahara" element={<ProtectedRoute roles={[Role.BENDAHARA]} />}>
                <Route path="dashboard" element={<BendaharaDashboard />} />
                <Route path="confirmation" element={<DepositConfirmation />} />
                <Route path="staff-debt" element={<StaffDebt />} />
            </Route>
            
            {/* Siswa Routes */}
            <Route path="/siswa" element={<ProtectedRoute roles={[Role.SISWA]} />}>
                <Route path="dashboard" element={<SiswaDashboard />} />
            </Route>

            <Route path="*" element={<div className="text-center mt-10"><h2>404: Halaman tidak ditemukan</h2></div>} />
        </Routes>
    );
};

const ProtectedRoute: React.FC<{ roles: Role[] }> = ({ roles }) => {
    const { user } = useAuth();

    if (!user || !roles.includes(user.role)) {
        // Redirect to their own dashboard or login if something is wrong
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default App;
