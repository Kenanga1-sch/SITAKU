import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';

type LoginFormInputs = { username: string; password: string };

const Login = () => {
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
                        <p className="text-slate-500 mt-2">Masuk ke akun SI-TAKU Anda.</p>
                    </div>

                    <div className="bg-slate-100 border border-slate-200 text-slate-600 p-4 rounded-lg text-sm">
                        <p className="font-semibold text-slate-700 mb-2">Gunakan akun demo untuk masuk:</p>
                        <p>Username: <code className="bg-slate-300 px-1.5 py-0.5 rounded text-slate-800 font-mono">admin</code></p>
                        <p className="mt-1">Password: <code className="bg-slate-300 px-1.5 py-0.5 rounded text-slate-800 font-mono">password</code></p>
                        <p className="text-xs mt-3 text-slate-500">Anda juga bisa mencoba username lain: `guru_a`, `bendahara`, `siswa_joko`</p>
                    </div>

                    {loginError && (
                        <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 rounded-md" role="alert">
                            <p>{loginError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <FormInput
                            id="username"
                            label="Username"
                            {...register('username', { required: 'Username tidak boleh kosong' })}
                            error={errors.username?.message}
                            placeholder="Masukkan username"
                        />
                        <FormInput
                            id="password"
                            label="Password"
                            type="password"
                            {...register('password', { required: 'Password tidak boleh kosong' })}
                            error={errors.password?.message}
                            placeholder="••••••••"
                        />
                        <div>
                            <FormButton
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? 'Memproses...' : 'Masuk'}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;