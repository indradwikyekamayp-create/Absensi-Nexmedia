// Admin Users Page - Employee Management
import { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    MoreVertical,
    Edit,
    KeyRound,
    UserX,
    UserCheck,
    Mail,
    Clock
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import { PositionBadge } from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { subscribeToUsers, createUser, resetUserPassword, deactivateUser, reactivateUser } from '../../services/userService';
import { POSITIONS, ROLES, WORK_HOURS_BY_POSITION } from '../../utils/constants';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPosition, setFilterPosition] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // New user form
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        position: '',
        workHoursTarget: 8,
    });

    // Subscribe to users
    useEffect(() => {
        const unsubscribe = subscribeToUsers((data) => {
            setUsers(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter users
    useEffect(() => {
        let filtered = users;

        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterPosition) {
            filtered = filtered.filter(u => u.position === filterPosition);
        }

        setFilteredUsers(filtered);
    }, [users, searchQuery, filterPosition]);

    // Handle position change in form
    const handlePositionChange = (position) => {
        setNewUser({
            ...newUser,
            position,
            workHoursTarget: WORK_HOURS_BY_POSITION[position] || 8
        });
    };

    // Create user
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');

        if (!newUser.name || !newUser.email || !newUser.password || !newUser.position) {
            setError('Semua field wajib diisi');
            return;
        }

        if (newUser.password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        try {
            setIsSubmitting(true);
            await createUser({
                ...newUser,
                role: ROLES.EMPLOYEE
            });

            setSuccess('Akun karyawan berhasil dibuat!');
            setShowCreateModal(false);
            setNewUser({ name: '', email: '', password: '', position: '', workHoursTarget: 8 });

            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset password
    const handleResetPassword = async () => {
        if (!selectedUser) return;

        try {
            setIsSubmitting(true);
            await resetUserPassword(selectedUser.email);

            setSuccess(`Link reset password telah dikirim ke ${selectedUser.email}`);
            setShowResetModal(false);
            setSelectedUser(null);

            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle user active status
    const handleToggleActive = async (user) => {
        try {
            if (user.isActive === false) {
                await reactivateUser(user.id);
                setSuccess(`${user.name} telah diaktifkan kembali`);
            } else {
                await deactivateUser(user.id);
                setSuccess(`${user.name} telah dinonaktifkan`);
            }

            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Memuat data karyawan..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Success/Error Messages */}
            {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 animate-fade-in">
                    {success}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 animate-fade-in">
                    {error}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Karyawan</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {users.filter(u => u.role === 'employee').length} karyawan terdaftar
                    </p>
                </div>

                <Button
                    onClick={() => setShowCreateModal(true)}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                >
                    Tambah Karyawan
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                        />
                    </div>

                    <div className="w-full sm:w-48">
                        <Select
                            value={filterPosition}
                            onChange={(e) => setFilterPosition(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Jabatan' },
                                ...POSITIONS.map(p => ({ value: p, label: p }))
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers
                    .filter(u => u.role === 'employee')
                    .map((user) => (
                        <Card key={user.id} className={`relative ${user.isActive === false ? 'opacity-60' : ''}`}>
                            {/* Status Badge */}
                            {user.isActive === false && (
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                        Nonaktif
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <Avatar
                                    src={user.photoURL}
                                    name={user.name}
                                    size="lg"
                                />

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                        {user.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {user.email}
                                    </p>
                                    <div className="mt-2">
                                        <PositionBadge position={user.position} />
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{user.workHoursTarget || 8} jam/hari</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setShowResetModal(true);
                                    }}
                                    leftIcon={<KeyRound className="w-4 h-4" />}
                                >
                                    Reset Password
                                </Button>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleToggleActive(user)}
                                    leftIcon={user.isActive === false ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                    className={user.isActive === false ? 'text-green-600' : 'text-red-600'}
                                >
                                    {user.isActive === false ? 'Aktifkan' : 'Nonaktifkan'}
                                </Button>
                            </div>
                        </Card>
                    ))}
            </div>

            {filteredUsers.filter(u => u.role === 'employee').length === 0 && (
                <Card className="text-center py-12">
                    <p className="text-slate-500 dark:text-slate-400">
                        Tidak ada karyawan yang sesuai dengan filter
                    </p>
                </Card>
            )}

            {/* Create User Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Tambah Karyawan Baru"
                size="md"
            >
                <form onSubmit={handleCreateUser} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Nama Lengkap"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="John Doe"
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="john@email.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        helperText="Karyawan bisa mengubah password setelah login"
                        required
                    />

                    <Select
                        label="Jabatan"
                        value={newUser.position}
                        onChange={(e) => handlePositionChange(e.target.value)}
                        options={POSITIONS.map(p => ({ value: p, label: p }))}
                        required
                    />

                    <Input
                        label="Target Jam Kerja per Hari"
                        type="number"
                        min={1}
                        max={12}
                        value={newUser.workHoursTarget}
                        onChange={(e) => setNewUser({ ...newUser, workHoursTarget: parseInt(e.target.value) })}
                        leftIcon={<Clock className="w-4 h-4" />}
                    />

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="flex-1"
                        >
                            Buat Akun
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={showResetModal}
                onClose={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                }}
                title="Reset Password"
                size="sm"
            >
                <div className="text-center space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                        Link reset password akan dikirim ke email:
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                        {selectedUser?.email}
                    </p>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowResetModal(false);
                                setSelectedUser(null);
                            }}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleResetPassword}
                            isLoading={isSubmitting}
                            className="flex-1"
                        >
                            Kirim Link
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UsersPage;
