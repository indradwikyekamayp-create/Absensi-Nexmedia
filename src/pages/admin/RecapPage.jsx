// Admin Recap Page - Attendance Recapitulation
import { useState, useEffect } from 'react';
import {
    Filter,
    Download,
    Calendar,
    Clock,
    Users,
    AlertCircle,
    CheckCircle,
    Coffee,
    CalendarOff
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner, { TableRowSkeleton } from '../../components/common/LoadingSpinner';
import { getUsers } from '../../services/userService';
import { getAttendanceByDateRange, calculateAttendanceSummary } from '../../services/attendanceService';
import { formatDateDisplay, formatTime, formatDuration, formatDeficit, getCutoffPeriod, formatCutoffLabel } from '../../utils/dateUtils';
import { POSITIONS, STATUS_LABELS } from '../../utils/constants';

const RecapPage = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    // Filters
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Set default date range to current cutoff period
    useEffect(() => {
        const { startDate: cutoffStart, endDate: cutoffEnd } = getCutoffPeriod();
        setStartDate(cutoffStart.toISOString().split('T')[0]);
        setEndDate(cutoffEnd.toISOString().split('T')[0]);
    }, []);

    // Fetch employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const users = await getUsers();
                setEmployees(users.filter(u => u.role === 'employee'));
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        fetchEmployees();
    }, []);

    // Fetch attendance data when filters change
    useEffect(() => {
        const fetchData = async () => {
            if (!startDate || !endDate) return;

            try {
                setIsLoading(true);
                const data = await getAttendanceByDateRange(
                    new Date(startDate),
                    new Date(endDate),
                    selectedEmployee || null
                );

                // Filter by position if selected
                let filteredData = data;
                if (selectedPosition) {
                    const employeeIds = employees
                        .filter(e => e.position === selectedPosition)
                        .map(e => e.id);
                    filteredData = data.filter(d => employeeIds.includes(d.userId));
                }

                setAttendanceData(filteredData);
                setSummary(calculateAttendanceSummary(filteredData));
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate, selectedEmployee, selectedPosition, employees]);

    // Get employee name by ID
    const getEmployeeName = (userId) => {
        const emp = employees.find(e => e.id === userId);
        return emp?.name || 'Unknown';
    };

    // Export to CSV
    const handleExport = () => {
        const headers = ['Tanggal', 'Nama', 'Jabatan', 'Masuk', 'Pulang', 'Durasi', 'Defisit', 'Status'];
        const rows = attendanceData.map(row => {
            const emp = employees.find(e => e.id === row.userId);
            return [
                row.date,
                emp?.name || '-',
                emp?.position || '-',
                row.checkIn ? formatTime(row.checkIn) : '-',
                row.checkOut ? formatTime(row.checkOut) : '-',
                formatDuration(row.durationMinutes),
                row.deficitMinutes > 0 ? formatDeficit(row.deficitMinutes) : '-',
                STATUS_LABELS[row.status] || row.status
            ];
        });

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rekap-absensi-${startDate}-${endDate}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Filter Panel */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select
                        label="Karyawan"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        options={[
                            { value: '', label: 'Semua Karyawan' },
                            ...employees.map(e => ({ value: e.id, label: e.name }))
                        ]}
                    />

                    <Select
                        label="Jabatan"
                        value={selectedPosition}
                        onChange={(e) => setSelectedPosition(e.target.value)}
                        options={[
                            { value: '', label: 'Semua Jabatan' },
                            ...POSITIONS.map(p => ({ value: p, label: p }))
                        ]}
                    />

                    <Input
                        label="Tanggal Mulai"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <Input
                        label="Tanggal Akhir"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Periode Cutoff: {formatCutoffLabel()}
                    </p>

                    <Button
                        variant="secondary"
                        onClick={handleExport}
                        disabled={attendanceData.length === 0}
                        leftIcon={<Download className="w-4 h-4" />}
                    >
                        Export CSV
                    </Button>
                </div>
            </Card>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.totalWorkDays}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Hari Kerja</p>
                    </Card>

                    <Card className="text-center bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                        <CalendarOff className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{summary.totalHolidays}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Libur</p>
                    </Card>

                    <Card className="text-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                        <Coffee className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{summary.totalSick}</p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">Sakit</p>
                    </Card>

                    <Card className="text-center bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 border-cyan-200 dark:border-cyan-800">
                        <Calendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{summary.totalLeave}</p>
                        <p className="text-sm text-cyan-600 dark:text-cyan-400">Izin</p>
                    </Card>

                    <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary.totalPKBattle}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">PK Battle</p>
                    </Card>

                    <Card className="text-center bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
                        <Clock className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatDuration(summary.totalDeficitMinutes)}</p>
                        <p className="text-sm text-red-600 dark:text-red-400">Total Defisit</p>
                    </Card>
                </div>
            )}

            {/* Data Table */}
            <Card padding="none">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Data Absensi ({attendanceData.length} record)
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Tanggal</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Nama</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Masuk</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Pulang</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Durasi</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Defisit</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRowSkeleton key={i} columns={7} />
                                ))
                            ) : attendanceData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                        Tidak ada data untuk filter yang dipilih
                                    </td>
                                </tr>
                            ) : (
                                attendanceData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                                            {formatDateDisplay(row.date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                            {getEmployeeName(row.userId)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                            {row.checkIn ? formatTime(row.checkIn) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                            {row.checkOut ? formatTime(row.checkOut) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                            {formatDuration(row.durationMinutes)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {row.deficitMinutes > 0 ? (
                                                <span className="text-red-600 dark:text-red-400 font-medium">
                                                    {formatDeficit(row.deficitMinutes)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={row.status} size="sm" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default RecapPage;
