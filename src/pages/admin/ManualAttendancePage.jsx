// Admin Manual Attendance Page
import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    User,
    FileText,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployees } from '../../services/userService';
import { createManualAttendance } from '../../services/attendanceService';
import { ATTENDANCE_STATUS, STATUS_LABELS } from '../../utils/constants';

const ManualAttendancePage = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        userId: '',
        date: new Date().toISOString().split('T')[0],
        checkInTime: '08:00',
        checkOutTime: '17:00',
        status: ATTENDANCE_STATUS.COMPLETED,
        notes: ''
    });

    // Fetch employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getEmployees();
                setEmployees(data);
            } catch (err) {
                console.error('Error fetching employees:', err);
            }
        };
        fetchEmployees();
    }, []);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.userId) {
            setError('Pilih karyawan terlebih dahulu');
            return;
        }

        if (!formData.date) {
            setError('Pilih tanggal');
            return;
        }

        try {
            setIsLoading(true);

            await createManualAttendance(user.uid, {
                userId: formData.userId,
                date: formData.date,
                checkInTime: formData.checkInTime,
                checkOutTime: formData.checkOutTime,
                status: formData.status,
                notes: formData.notes || 'Input manual oleh admin'
            });

            setSuccess('Data absensi berhasil disimpan!');

            // Reset form
            setFormData({
                userId: '',
                date: new Date().toISOString().split('T')[0],
                checkInTime: '08:00',
                checkOutTime: '17:00',
                status: ATTENDANCE_STATUS.COMPLETED,
                notes: ''
            });

            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const statusOptions = [
        { value: ATTENDANCE_STATUS.COMPLETED, label: STATUS_LABELS.completed },
        { value: ATTENDANCE_STATUS.PK_BATTLE, label: STATUS_LABELS.pk_battle },
        { value: ATTENDANCE_STATUS.EARLY_LEAVE, label: STATUS_LABELS.early_leave },
        { value: ATTENDANCE_STATUS.HOLIDAY, label: STATUS_LABELS.holiday },
        { value: ATTENDANCE_STATUS.SICK, label: STATUS_LABELS.sick },
        { value: ATTENDANCE_STATUS.LEAVE, label: STATUS_LABELS.leave },
    ];

    const needsTimes = [ATTENDANCE_STATUS.COMPLETED, ATTENDANCE_STATUS.PK_BATTLE, ATTENDANCE_STATUS.EARLY_LEAVE].includes(formData.status);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revisi Absensi</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Input manual data absensi untuk karyawan yang lupa absen
                </p>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3 animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
            )}

            {/* Form */}
            <Card>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Select
                        label="Pilih Karyawan"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        options={employees.map(e => ({ value: e.id, label: `${e.name} - ${e.position}` }))}
                        placeholder="Pilih karyawan..."
                    />

                    <Input
                        label="Tanggal"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        leftIcon={<Calendar className="w-4 h-4" />}
                    />

                    <Select
                        label="Status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        options={statusOptions}
                    />

                    {needsTimes && (
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Jam Masuk"
                                type="time"
                                value={formData.checkInTime}
                                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                                leftIcon={<Clock className="w-4 h-4" />}
                            />

                            <Input
                                label="Jam Pulang"
                                type="time"
                                value={formData.checkOutTime}
                                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                                leftIcon={<Clock className="w-4 h-4" />}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Keterangan
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Contoh: Lupa absen karena buru-buru"
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            leftIcon={<FileText className="w-5 h-5" />}
                        >
                            Simpan Data Absensi
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Catatan:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                            <li>Data yang diinput akan ditandai sebagai "Input Manual"</li>
                            <li>Pastikan tanggal dan waktu sudah benar sebelum menyimpan</li>
                            <li>Data yang sudah tersimpan tidak bisa diubah</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ManualAttendancePage;
