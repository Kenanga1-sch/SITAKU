

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../contexts/UIContext';
import { Role } from '../types';
import { DashboardIcon, UserGroupIcon, DataMasterIcon, TransactionIcon, DepositIcon, ConfirmationIcon, DebtIcon, UserCircleIcon, CloseIcon } from './Icons';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
    const { closeSidebar } = useUI();
    return (
        <NavLink
            to={to}
            end
            onClick={closeSidebar} // Close sidebar on navigation
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors rounded-lg ${isActive ? 'bg-indigo-600 font-semibold' : ''}`
            }
        >
            <span className="mr-3">{icon}</span>
            {label}
        </NavLink>
    );
};

const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const { isSidebarOpen, closeSidebar } = useUI();

    const renderNavLinks = () => {
        switch (user?.role) {
            case Role.ADMIN:
                return (
                    <>
                        <NavItem to="/admin" icon={<DashboardIcon />} label="Dashboard" />
                        <NavItem to="/admin/users" icon={<UserGroupIcon />} label="Manajemen User" />
                        <NavItem to="/admin/classes" icon={<DataMasterIcon />} label="Manajemen Kelas" />
                    </>
                );
            case Role.GURU:
                return (
                    <>
                        <NavItem to="/guru" icon={<DashboardIcon />} label="Dashboard" />
                        <NavItem to="/guru/transactions" icon={<TransactionIcon />} label="Transaksi Siswa" />
                        <NavItem to="/guru/deposit" icon={<DepositIcon />} label="Setoran Harian" />
                    </>
                );
            case Role.BENDAHARA:
                return (
                    <>
                        <NavItem to="/bendahara" icon={<DashboardIcon />} label="Dashboard" />
                        <NavItem to="/bendahara/confirmations" icon={<ConfirmationIcon />} label="Konfirmasi Setoran" />
                        <NavItem to="/bendahara/staff-debt" icon={<DebtIcon />} label="Utang Staff" />
                    </>
                );
            case Role.SISWA:
                 return (
                    <>
                        <NavItem to="/siswa" icon={<UserCircleIcon />} label="Dashboard Saya" />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* Backdrop for mobile */}
            <div 
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeSidebar}
            ></div>

            {/* Sidebar */}
            <aside 
                className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white flex-col p-4 z-40
                           transform transition-transform md:relative md:translate-x-0 md:flex
                           ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex justify-between items-center text-center py-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-wider">SI-TAKU</h1>
                        <p className="text-sm text-slate-400">Tabungan Siswa</p>
                    </div>
                    <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white">
                        <CloseIcon />
                    </button>
                </div>
                <nav className="flex flex-col space-y-2">
                    {renderNavLinks()}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
