
import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './pages/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Role } from './types';

// Page Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ClassManagement from './pages/admin/ClassManagement';
import DataMaster from './pages/admin/DataMaster';

import GuruDashboard from './pages/guru/GuruDashboard';
import StudentTransactions from './pages/guru/StudentTransactions';
import DailyDeposit from './pages/guru/DailyDeposit';

import BendaharaDashboard from './pages/bendahara/BendaharaDashboard';
import DepositConfirmation from './pages/bendahara/DepositConfirmation';
import StaffDebt from './pages/bendahara/StaffDebt';

import SiswaDashboard from './pages/siswa/SiswaDashboard';


const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet />
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
        // Redirect to their default dashboard if trying to access a restricted page
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
      <Router>
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
              <Route path="data-master" element={<DataMaster />} />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
