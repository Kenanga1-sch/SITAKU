

import React, { ReactNode, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Role } from './types';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const ClassManagement = lazy(() => import('./pages/admin/ClassManagement'));
// const DataMaster = lazy(() => import('./pages/admin/DataMaster'));

const GuruDashboard = lazy(() => import('./pages/guru/GuruDashboard'));
const StudentTransactions = lazy(() => import('./pages/guru/StudentTransactions'));
const DailyDeposit = lazy(() => import('./pages/guru/DailyDeposit'));

const BendaharaDashboard = lazy(() => import('./pages/bendahara/BendaharaDashboard'));
const DepositConfirmation = lazy(() => import('./pages/bendahara/DepositConfirmation'));
const StaffDebt = lazy(() => import('./pages/bendahara/StaffDebt'));

const SiswaDashboard = lazy(() => import('./pages/siswa/SiswaDashboard'));


const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                    <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: ReactNode; roles?: Role[] }> = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && user && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};


const RoleBasedRedirect: React.FC = () => {
    const { user } = useAuth();
    switch (user?.role) {
        case Role.ADMIN:
            return <Navigate to="/admin" />;
        case Role.GURU:
            return <Navigate to="/guru" />;
        case Role.BENDAHARA:
            return <Navigate to="/bendahara" />;
        case Role.SISWA:
            return <Navigate to="/siswa" />;
        default:
            return <Navigate to="/login" />;
    }
};


function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Router>
            <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route 
                        path="/" 
                        element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                        }
                    >
                        <Route index element={<RoleBasedRedirect />} />
                        
                        {/* Admin Routes */}
                        <Route path="admin" element={<ProtectedRoute roles={[Role.ADMIN]}><Outlet /></ProtectedRoute>}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="classes" element={<ClassManagement />} />
                            {/* <Route path="data-master" element={<DataMaster />} /> */}
                        </Route>

                        {/* Guru Routes */}
                        <Route path="guru" element={<ProtectedRoute roles={[Role.GURU]}><Outlet /></ProtectedRoute>}>
                            <Route index element={<GuruDashboard />} />
                            <Route path="transactions" element={<StudentTransactions />} />
                            <Route path="deposit" element={<DailyDeposit />} />
                        </Route>

                        {/* Bendahara Routes */}
                        <Route path="bendahara" element={<ProtectedRoute roles={[Role.BENDAHARA]}><Outlet /></ProtectedRoute>}>
                            <Route index element={<BendaharaDashboard />} />
                            <Route path="confirmations" element={<DepositConfirmation />} />
                            <Route path="staff-debt" element={<StaffDebt />} />
                        </Route>

                        {/* Siswa Routes */}
                        <Route path="siswa" element={<ProtectedRoute roles={[Role.SISWA]}><Outlet /></ProtectedRoute>}>
                            <Route index element={<SiswaDashboard />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Suspense>
        </Router>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
