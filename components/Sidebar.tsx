

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../contexts/UIContext';
import { Role } from '../types';
import { 
    DashboardIcon, 
    UserGroupIcon, 
    DataMasterIcon, 
    TransactionIcon, 
    DepositIcon,
    ConfirmationIcon,
    DebtIcon,
    AcademicCapIcon,
    CloseIcon,
    DocumentReportIcon
} from './Icons';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

const NavItem = React.memo<NavItemProps>(({ to, icon, label, onClick }) => (
    <li>
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-200 hover:bg-indigo-800 hover:text-white'
                }`
            }
        >
            {icon}
            <span className="font-medium">{label}</span>
        </NavLink>
    </li>
));
NavItem.displayName = 'NavItem';

const Sidebar = () => {
    const { user } = useAuth();
    const { isSidebarOpen, closeSidebar } = useUI();
    const location = useLocation();

    React.useEffect(() => {
        if (isSidebarOpen) {
            closeSidebar();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const adminNav = [
        { to: '/admin/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
        { to: '/admin/users', icon: <UserGroupIcon />, label: 'Manajemen User' },
        { to: '/admin/classes', icon: <AcademicCapIcon />, label: 'Manajemen Kelas' },
        { to: '/admin/students', icon: <DataMasterIcon />, label: 'Manajemen Siswa' },
    ];

    const guruNav = [
        { to: '/guru/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
        { to: '/guru/transactions', icon: <TransactionIcon />, label: 'Transaksi Siswa' },
        { to: '/guru/deposit', icon: <DepositIcon />, label: 'Setoran Harian' },
    ];

    const bendaharaNav = [
        { to: '/bendahara/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
        { to: '/bendahara/confirmation', icon: <ConfirmationIcon />, label: 'Konfirmasi Setoran' },
        { to: '/bendahara/staff-debt', icon: <DebtIcon />, label: 'Utang Staff' },
        { to: '/bendahara/reports', icon: <DocumentReportIcon />, label: 'Laporan' },
    ];
    
    const siswaNav = [
        { to: '/siswa/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    ];

    const getNavItems = () => {
        if (!user) return [];
        switch (user.role) {
            case Role.ADMIN: return adminNav;
            case Role.GURU: return guruNav;
            case Role.BENDAHARA: return bendaharaNav;
            case Role.SISWA: return siswaNav;
            default: return [];
        }
    };

    const navItems = getNavItems();
    
    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-indigo-900 text-white">
            <div className="flex items-center justify-between p-4 border-b border-indigo-800">
                <h1 className="text-xl font-bold">SI-TAKU</h1>
                 <button onClick={closeSidebar} className="md:hidden text-indigo-200 hover:text-white">
                    <CloseIcon />
                </button>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <NavItem key={item.to} {...item} onClick={closeSidebar} />
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-indigo-800">
                <p className="text-sm text-indigo-300">© {new Date().getFullYear()} SI-TAKU</p>
            </div>
        </div>
    );
    
    return (
        <>
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-40 transform md:hidden print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="w-64 h-full">
                    <SidebarContent />
                </div>
            </div>
            {isSidebarOpen && <div onClick={closeSidebar} className="fixed inset-0 bg-black opacity-50 z-30 md:hidden print:hidden"></div>}

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0 print:hidden">
                 <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;