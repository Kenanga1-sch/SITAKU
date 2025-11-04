
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { DashboardIcon, UserGroupIcon, DataMasterIcon, TransactionIcon, DepositIcon, ConfirmationIcon, DebtIcon, UserCircleIcon } from './Icons';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) =>
            `flex items-center px-4 py-3 text-slate-200 hover:bg-slate-700 transition-colors rounded-lg ${isActive ? 'bg-slate-700 font-semibold' : ''}`
        }
    >
        <span className="mr-3">{icon}</span>
        {label}
    </NavLink>
);

const Sidebar: React.FC = () => {
    const { user } = useAuth();

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
        <aside className="w-64 bg-slate-800 text-white flex flex-col p-4">
            <div className="text-center py-4 mb-6">
                <h1 className="text-2xl font-bold tracking-wider">SI-TAKU</h1>
                <p className="text-sm text-slate-400">Tabungan Siswa</p>
            </div>
            <nav className="flex flex-col space-y-2">
                {renderNavLinks()}
            </nav>
        </aside>
    );
};

export default Sidebar;
