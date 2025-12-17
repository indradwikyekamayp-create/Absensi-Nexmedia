// Employee Change Password Page
import { useState } from 'react';
import { KeyRound, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';

const ChangePasswordPage = () => {
    const { changePassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Semua field wajib diisi');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password baru minimal 6 karakter');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok');
            return;
        }

        try {
            setIsLoading(true);
            await changePassword(currentPassword, newPassword);
            setSuccess('Password berhasil diubah!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ubah Password</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Amankan akun Anda dengan password baru</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                            <AlertCircle className="w-4 h-4" />{error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4" />{success}
                        </div>
                    )}

                    <Input
                        label="Password Lama"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        leftIcon={<Lock className="w-4 h-4" />}
                        placeholder="Masukkan password lama"
                    />

                    <Input
                        label="Password Baru"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        leftIcon={<Lock className="w-4 h-4" />}
                        placeholder="Minimal 6 karakter"
                    />

                    <Input
                        label="Konfirmasi Password Baru"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        leftIcon={<Lock className="w-4 h-4" />}
                        placeholder="Ulangi password baru"
                    />

                    <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                        Simpan Password Baru
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default ChangePasswordPage;
