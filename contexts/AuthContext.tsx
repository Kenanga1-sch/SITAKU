import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuthContextType {
    user: User | null;
    login: (credentials: { username: string; password: string; }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Note: Using a hook inside the provider is fine as long as the provider is inside the Router context
    const navigate = useNavigate();

    const fetchProfile = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const profile = await api.getProfile();
                setUser(profile);
            } catch (error) {
                console.error('Failed to fetch profile, logging out.', error);
                localStorage.removeItem('token');
                setUser(null);
                // Can't use navigate here directly as it might be outside router context on initial load
            }
        }
        setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = async (credentials: { username: string; password: string; }) => {
        const { token, user: loggedInUser } = await api.login(credentials);
        localStorage.setItem('token', token);
        setUser(loggedInUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login', { replace: true });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    
    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
