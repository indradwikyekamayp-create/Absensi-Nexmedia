// Admin Dashboard Page
import { useState, useEffect } from 'react';
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    Coffee,
    CalendarOff,
    MapPin,
    Activity
} from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import EmployeeGrid from '../../components/dashboard/EmployeeGrid';
import LiveMap from '../../components/dashboard/LiveMap';
import Card from '../../components/common/Card';
import { subscribeToUsers } from '../../services/userService';
import { subscribeToAllTodayAttendance } from '../../services/attendanceService';
import { ATTENDANCE_STATUS } from '../../utils/constants';
import { formatDuration } from '../../utils/dateUtils';

const DashboardPage = () => {
    const [employees, setEmployees] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

    // Subscribe to real-time data
    useEffect(() => {
        setIsLoading(true);

        // Subscribe to users
        const unsubscribeUsers = subscribeToUsers((users) => {
            // Filter only active employees
            const activeEmployees = users.filter(u => u.role === 'employee' && u.isActive !== false);
            setEmployees(activeEmployees);
        });

        // Subscribe to today's attendance
        const unsubscribeAttendance = subscribeToAllTodayAttendance((atts) => {
            setAttendances(atts);
            setIsLoading(false);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeAttendance();
        };
    }, []);

    // Calculate statistics
    const stats = {
        total: employees.length,
        present: attendances.filter(a =>
            [ATTENDANCE_STATUS.WORKING, ATTENDANCE_STATUS.COMPLETED, ATTENDANCE_STATUS.PK_BATTLE, ATTENDANCE_STATUS.EARLY_LEAVE].includes(a.status)
        ).length,
        working: attendances.filter(a => a.status === ATTENDANCE_STATUS.WORKING).length,
        sick: attendances.filter(a => a.status === ATTENDANCE_STATUS.SICK).length,
        leave: attendances.filter(a => a.status === ATTENDANCE_STATUS.LEAVE).length,
        holiday: attendances.filter(a => a.status === ATTENDANCE_STATUS.HOLIDAY).length,
        absent: employees.length - attendances.length,
        totalDeficit: attendances.reduce((sum, a) => sum + (a.deficitMinutes || 0), 0),
    };

    const handleEmployeeClick = (employee) => {
        // TODO: Show employee detail modal
        console.log('Employee clicked:', employee);
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatsCard
                    title="Total Karyawan"
                    value={stats.total}
                    icon={Users}
                    color="primary"
                />
                <StatsCard
                    title="Hadir"
                    value={stats.present}
                    icon={UserCheck}
                    color="green"
                />
                <StatsCard
                    title="Sedang Kerja"
                    value={stats.working}
                    icon={Activity}
                    color="blue"
                />
                <StatsCard
                    title="Sakit"
                    value={stats.sick}
                    icon={Coffee}
                    color="yellow"
                />
                <StatsCard
                    title="Izin"
                    value={stats.leave}
                    icon={CalendarOff}
                    color="purple"
                />
                <StatsCard
                    title="Belum Hadir"
                    value={stats.absent}
                    icon={UserX}
                    color="red"
                />
            </div>

            {/* Deficit Summary */}
            {stats.totalDeficit > 0 && (
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Total Kekurangan Jam Hari Ini</p>
                                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{formatDuration(stats.totalDeficit)}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* View Toggle & Live Monitoring */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Employee Grid */}
                <div className="flex-1">
                    <Card padding="none">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Live Monitoring
                                </h2>

                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid'
                                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <Users className="w-4 h-4 inline mr-1" />
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('map')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'map'
                                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Peta
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            {viewMode === 'grid' ? (
                                <EmployeeGrid
                                    employees={employees}
                                    attendances={attendances}
                                    isLoading={isLoading}
                                    onEmployeeClick={handleEmployeeClick}
                                />
                            ) : (
                                <LiveMap
                                    employees={employees}
                                    attendances={attendances}
                                    height="500px"
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card hover className="cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                            <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Kelola Karyawan</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tambah atau edit data karyawan</p>
                        </div>
                    </div>
                </Card>

                <Card hover className="cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Revisi Absen</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Input absensi manual</p>
                        </div>
                    </div>
                </Card>

                <Card hover className="cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Lihat Laporan</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Rekap dan laporan gaji</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
