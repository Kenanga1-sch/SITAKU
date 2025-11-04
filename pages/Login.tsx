import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Role } from '../types';

// FIX: Define login form inputs directly as the User type doesn't include a password.
type LoginFormInputs = { username: string; password: string };

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>();
    const [loginError, setLoginError] = React.useState<string | null>(null);
    const { login, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        setLoginError(null);
        try {
            await login(data);
        } catch (error) {
            setLoginError((error as Error).message || 'Username atau password salah.');
        }
    };
    
    React.useEffect(() => {
        if (isAuthenticated && user) {
             switch (user.role) {
                case Role.ADMIN:
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case Role.GURU:
                    navigate('/guru/dashboard', { replace: true });
                    break;
                case Role.BENDAHARA:
                    navigate('/bendahara/dashboard', { replace: true });
                    break;
                case Role.SISWA:
                    navigate('/siswa/dashboard', { replace: true });
                    break;
                default:
                    navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-800">Selamat Datang!</h1>
                        <p className="text-slate-500 mt-2">Masuk ke akun Anda untuk melanjutkan.</p>
                    </div>

                    {loginError && (
                        <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 rounded-md" role="alert">
                            <p>{loginError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                {...register('username', { required: 'Username tidak boleh kosong' })}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Masukkan username"
                            />
                            {errors.username && <p className="text-sm text-rose-600 mt-1">{errors.username.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register('password', { required: 'Password tidak boleh kosong' })}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                             {errors.password && <p className="text-sm text-rose-600 mt-1">{errors.password.message}</p>}
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                            >
                                {isSubmitting ? 'Memproses...' : 'Masuk'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
