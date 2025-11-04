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
