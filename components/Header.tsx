
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogoutIcon } from './Icons';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleDisplayName = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div>
                {/* Could add breadcrumbs or page title here */}
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-semibold text-slate-800">{user?.username}</p>
                    <p className="text-sm text-slate-500">{user && getRoleDisplayName(user.role)}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
