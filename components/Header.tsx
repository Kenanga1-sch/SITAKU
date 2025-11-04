

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../contexts/UIContext';
import { LogoutIcon, MenuIcon } from './Icons';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useUI();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleDisplayName = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-20">
            {/* Hamburger menu for mobile */}
            <button onClick={toggleSidebar} className="md:hidden text-slate-600 hover:text-slate-900">
                <MenuIcon />
            </button>

            <div className="flex-grow">
                {/* Could add breadcrumbs or page title here */}
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-semibold text-slate-800 hidden sm:block">{user?.username}</p>
                    <p className="text-sm text-slate-500 hidden sm:block">{user && getRoleDisplayName(user.role)}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Logout"
                >
                    <LogoutIcon />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
