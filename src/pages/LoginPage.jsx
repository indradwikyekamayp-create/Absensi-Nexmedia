// Login Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Email dan password wajib diisi');
            return;
        }

        try {
            setError('');
            setIsLoading(true);

            const profile = await login(email, password);

            // Redirect based on role
            if (profile.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/attendance');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Left Side - Branding (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10">
                <div className="max-w-md text-center text-white">
                    <img
                        src="/logo.jpg"
                        alt="NEX Media Indonesia"
                        className="w-32 h-32 mx-auto rounded-2xl shadow-2xl mb-8"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <h1 className="text-4xl font-bold mb-4">
                        NEX <span className="text-primary-300">Attendance</span>
                    </h1>
                    <p className="text-lg text-slate-300 mb-8">
                        Sistem Absensi & Payroll Modern untuk NEX Media Indonesia
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                            <p className="text-3xl font-bold">24/7</p>
                            <p className="text-sm text-slate-300">Akses Kapanpun</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                            <p className="text-3xl font-bold">GPS</p>
                            <p className="text-sm text-slate-300">Validasi Lokasi</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                            <p className="text-3xl font-bold">Live</p>
                            <p className="text-sm text-slate-300">Real-time</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <Card className="w-full max-w-md" padding="xl">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <img
                            src="/logo.jpg"
                            alt="NEX Media Indonesia"
                            className="w-20 h-20 mx-auto rounded-xl shadow-lg mb-4"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            NEX <span className="text-primary-600">Attendance</span>
                        </h1>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Selamat Datang! 👋
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Masuk ke akun Anda untuk melanjutkan
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={<Mail className="w-5 h-5" />}
                            disabled={isLoading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            leftIcon={<Lock className="w-5 h-5" />}
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                            Masuk
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Lupa password? Hubungi Admin untuk reset.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-xs text-slate-400">
                            © 2024 NEX Media Indonesia. All rights reserved.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
