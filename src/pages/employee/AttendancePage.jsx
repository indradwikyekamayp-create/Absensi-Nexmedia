// Employee Attendance Page
import { useState, useEffect } from 'react';
import {
    LogIn,
    LogOut,
    MapPin,
    RefreshCw,
    Calendar,
    Coffee,
    FileText,
    AlertCircle,
    CheckCircle,
    Home
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import AttendanceMap from '../../components/attendance/AttendanceMap';
import WorkTimer from '../../components/attendance/WorkTimer';
import PKBattleModal from '../../components/attendance/PKBattleModal';
import StatusBadge from '../../components/common/StatusBadge';
import useGeolocation from '../../hooks/useGeolocation';
import { useAuth } from '../../contexts/AuthContext';
import {
    checkIn,
    checkOut,
    markHoliday,
    markSick,
    markLeave,
    subscribeToTodayAttendance
} from '../../services/attendanceService';
import { formatTime, getElapsedMinutes } from '../../utils/dateUtils';
import { PK_BATTLE_POSITIONS, ATTENDANCE_STATUS } from '../../utils/constants';

const AttendancePage = () => {
    const { userProfile } = useAuth();
    const { location, distance, isWithinRadius, error: geoError, isLoading: geoLoading, refresh: refreshLocation } = useGeolocation({ enableWatch: true });

    const [attendance, setAttendance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPKModal, setShowPKModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [isWFH, setIsWFH] = useState(false);

    const targetMinutes = (userProfile?.workHoursTarget || 7) * 60;
    const isPKBattleEligible = PK_BATTLE_POSITIONS.includes(userProfile?.position);

    // Subscribe to today's attendance
    useEffect(() => {
        if (!userProfile?.id) return;

        const unsubscribe = subscribeToTodayAttendance(userProfile.id, (att) => {
            setAttendance(att);
        });

        return () => unsubscribe();
    }, [userProfile?.id]);

    // Clear messages after delay
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Handle Check In
    const handleCheckIn = async () => {
        if (!location && !isWFH) {
            setError('Tidak dapat mendapatkan lokasi. Pastikan GPS aktif.');
            return;
        }

        if (!isWFH && !isWithinRadius) {
            setError('Anda berada di luar area kantor. Tidak dapat absen masuk.');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            await checkIn(userProfile.id, location, isWFH);
            setSuccess('Berhasil absen masuk! Selamat bekerja.');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Check Out
    const handleCheckOut = async () => {
        if (!attendance?.checkIn) {
            setError('Anda belum absen masuk');
            return;
        }

        const elapsedMinutes = getElapsedMinutes(attendance.checkIn);

        // Check if PK Battle modal should be shown
        if (isPKBattleEligible && elapsedMinutes < targetMinutes) {
            setShowPKModal(true);
            return;
        }

        // Normal checkout
        await performCheckOut(false);
    };

    // Perform actual checkout
    const performCheckOut = async (isPKBattle = false) => {
        try {
            setIsLoading(true);
            setError(null);
            setShowPKModal(false);

            await checkOut(userProfile.id, location, targetMinutes, isPKBattle);
            setSuccess(isPKBattle
                ? 'PK Battle tercatat! Jam kerja dihitung penuh.'
                : 'Berhasil absen pulang! Sampai jumpa besok.'
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Leave Request
    const handleLeaveRequest = async (type) => {
        try {
            setIsLoading(true);
            setError(null);

            if (type === 'holiday') {
                await markHoliday(userProfile.id);
                setSuccess('Hari ini ditandai sebagai hari libur.');
            } else if (type === 'sick') {
                await markSick(userProfile.id);
                setSuccess('Izin sakit berhasil dicatat. Semoga lekas sembuh!');
            } else if (type === 'leave') {
                await markLeave(userProfile.id);
                setSuccess('Izin berhasil dicatat.');
            }

            setShowLeaveModal(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Determine current state
    const isCheckedIn = attendance?.checkIn && !attendance?.checkOut && attendance?.status === ATTENDANCE_STATUS.WORKING;
    const isCompleted = attendance?.checkOut || [ATTENDANCE_STATUS.COMPLETED, ATTENDANCE_STATUS.PK_BATTLE, ATTENDANCE_STATUS.EARLY_LEAVE].includes(attendance?.status);
    const isOnLeave = [ATTENDANCE_STATUS.HOLIDAY, ATTENDANCE_STATUS.SICK, ATTENDANCE_STATUS.LEAVE].includes(attendance?.status);

    return (
        <div className="space-y-6">
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

            {/* Map Card */}
            <Card padding="none" className="overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Lokasi Anda</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* WFH Toggle */}
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isWFH}
                                    onChange={(e) => setIsWFH(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    disabled={isCheckedIn || isCompleted}
                                />
                                <Home className="w-4 h-4" />
                                <span className="text-slate-600 dark:text-slate-400">WFH</span>
                            </label>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={refreshLocation}
                                disabled={geoLoading}
                            >
                                <RefreshCw className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {geoError && (
                        <p className="mt-2 text-sm text-red-500">{geoError}</p>
                    )}
                </div>

                <AttendanceMap
                    userLocation={location}
                    isWithinRadius={isWFH || isWithinRadius}
                    distance={distance}
                    height="250px"
                />

                {/* Location Status */}
                <div className={`p-3 text-center text-sm font-medium ${isWFH
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : isWithinRadius
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                    {isWFH
                        ? '🏠 Mode Work From Home aktif'
                        : isWithinRadius
                            ? '✓ Anda berada dalam area kantor'
                            : '✗ Anda berada di luar area kantor'}
                </div>
            </Card>

            {/* Current Status Card */}
            {attendance && (
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Status Hari Ini</h3>
                        <StatusBadge status={attendance.status} size="lg" />
                    </div>

                    {/* Work Timer */}
                    {isCheckedIn && (
                        <WorkTimer
                            checkInTime={attendance.checkIn}
                            targetMinutes={targetMinutes}
                        />
                    )}

                    {/* Attendance Info */}
                    {attendance.checkIn && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Jam Masuk</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {formatTime(attendance.checkIn)}
                                </p>
                            </div>

                            {attendance.checkOut && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Jam Pulang</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {formatTime(attendance.checkOut)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            )}

            {/* Action Buttons */}
            <Card>
                <div className="space-y-3">
                    {!attendance && !isOnLeave && (
                        <>
                            <Button
                                onClick={handleCheckIn}
                                fullWidth
                                size="lg"
                                isLoading={isLoading}
                                disabled={!isWFH && !isWithinRadius}
                                leftIcon={<LogIn className="w-5 h-5" />}
                            >
                                Absen Masuk
                            </Button>

                            <Button
                                onClick={() => setShowLeaveModal(true)}
                                fullWidth
                                size="lg"
                                variant="secondary"
                                leftIcon={<Calendar className="w-5 h-5" />}
                            >
                                Izin / Sakit / Libur
                            </Button>
                        </>
                    )}

                    {isCheckedIn && (
                        <Button
                            onClick={handleCheckOut}
                            fullWidth
                            size="lg"
                            variant="danger"
                            isLoading={isLoading}
                            leftIcon={<LogOut className="w-5 h-5" />}
                        >
                            Absen Pulang
                        </Button>
                    )}

                    {(isCompleted || isOnLeave) && (
                        <div className="text-center py-4">
                            <p className="text-slate-500 dark:text-slate-400">
                                {isOnLeave
                                    ? 'Anda sedang izin/libur hari ini'
                                    : 'Anda sudah menyelesaikan absensi hari ini'}
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                Sampai jumpa besok! 👋
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* PK Battle Modal */}
            {showPKModal && attendance && (
                <PKBattleModal
                    isOpen={showPKModal}
                    onClose={() => setShowPKModal(false)}
                    actualMinutes={getElapsedMinutes(attendance.checkIn)}
                    targetMinutes={targetMinutes}
                    onPKBattle={() => performCheckOut(true)}
                    onEarlyLeave={() => performCheckOut(false)}
                    isLoading={isLoading}
                />
            )}

            {/* Leave Request Modal */}
            <Modal
                isOpen={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                title="Pilih Jenis Izin"
                size="sm"
            >
                <div className="space-y-3">
                    <Button
                        onClick={() => handleLeaveRequest('holiday')}
                        fullWidth
                        variant="secondary"
                        isLoading={isLoading}
                        leftIcon={<Calendar className="w-5 h-5 text-purple-500" />}
                    >
                        Hari Libur / Off
                    </Button>

                    <Button
                        onClick={() => handleLeaveRequest('sick')}
                        fullWidth
                        variant="secondary"
                        isLoading={isLoading}
                        leftIcon={<Coffee className="w-5 h-5 text-orange-500" />}
                    >
                        Sakit
                    </Button>

                    <Button
                        onClick={() => handleLeaveRequest('leave')}
                        fullWidth
                        variant="secondary"
                        isLoading={isLoading}
                        leftIcon={<FileText className="w-5 h-5 text-cyan-500" />}
                    >
                        Izin Lainnya
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default AttendancePage;
