// Employee Card Component with Pulse Indicator
import { Clock } from 'lucide-react';
import Avatar from '../common/Avatar';
import { PulseDot, PositionBadge } from '../common/StatusBadge';
import { formatTime, getElapsedMinutes, formatLiveTimer } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';

const EmployeeCard = ({
    employee,
    attendance,
    onClick
}) => {
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    // Determine status based on attendance
    const getStatus = () => {
        if (!attendance) return 'not_checked_in';
        if (attendance.status === 'sick') return 'sick';
        if (attendance.status === 'holiday') return 'holiday';
        if (attendance.status === 'leave') return 'leave';
        if (attendance.status === 'pk_battle') return 'pk_battle';
        if (attendance.status === 'working') return 'working';
        if (attendance.status === 'completed' || attendance.checkOut) return 'done';
        if (attendance.status === 'early_leave') return 'done';
        return 'not_checked_in';
    };

    const status = getStatus();

    // Live timer for working employees
    useEffect(() => {
        if (status === 'working' && attendance?.checkIn) {
            const updateTimer = () => {
                setElapsedMinutes(getElapsedMinutes(attendance.checkIn));
            };

            updateTimer();
            const interval = setInterval(updateTimer, 60000); // Update every minute

            return () => clearInterval(interval);
        }
    }, [status, attendance?.checkIn]);

    const statusLabels = {
        working: 'Sedang Kerja',
        pk_battle: 'PK Battle',
        done: 'Sudah Pulang',
        not_checked_in: 'Belum Hadir',
        sick: 'Sakit',
        holiday: 'Libur',
        leave: 'Izin',
    };

    return (
        <div
            onClick={onClick}
            className="relative bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 cursor-pointer group"
        >
            {/* Pulse Indicator */}
            <div className="absolute top-3 right-3">
                <PulseDot status={status} size="md" />
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-3 mb-3">
                <Avatar
                    src={employee.photoURL}
                    name={employee.name}
                    size="lg"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {employee.name}
                    </h3>
                    <PositionBadge position={employee.position} />
                </div>
            </div>

            {/* Status & Time Info */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                    <span className={`font-medium ${status === 'working' ? 'text-green-600 dark:text-green-400' :
                            status === 'pk_battle' ? 'text-blue-600 dark:text-blue-400' :
                                status === 'done' ? 'text-slate-600 dark:text-slate-400' :
                                    status === 'sick' ? 'text-orange-600 dark:text-orange-400' :
                                        status === 'holiday' ? 'text-purple-600 dark:text-purple-400' :
                                            status === 'leave' ? 'text-cyan-600 dark:text-cyan-400' :
                                                'text-red-600 dark:text-red-400'
                        }`}>
                        {statusLabels[status]}
                    </span>
                </div>

                {attendance?.checkIn && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Jam Masuk</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            {formatTime(attendance.checkIn)}
                        </span>
                    </div>
                )}

                {/* Live Timer for Working */}
                {status === 'working' && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-lg font-mono font-bold text-green-600 dark:text-green-400">
                                {formatLiveTimer(elapsedMinutes)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Duration for completed */}
                {attendance?.checkOut && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Jam Pulang</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            {formatTime(attendance.checkOut)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeCard;
