// Employee History Page
import { useState, useEffect } from 'react';
import { Calendar, Clock, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getAttendanceByDateRange, calculateAttendanceSummary } from '../../services/attendanceService';
import { formatDateDisplay, formatTime, formatDuration, formatDeficit, getCutoffPeriod } from '../../utils/dateUtils';

const HistoryPage = () => {
    const { userProfile } = useAuth();
    const [attendanceData, setAttendanceData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const { startDate: cutoffStart, endDate: cutoffEnd } = getCutoffPeriod();
        setStartDate(cutoffStart.toISOString().split('T')[0]);
        setEndDate(cutoffEnd.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!startDate || !endDate || !userProfile?.id) return;
            setIsLoading(true);
            try {
                const data = await getAttendanceByDateRange(new Date(startDate), new Date(endDate), userProfile.id);
                setAttendanceData(data);
                setSummary(calculateAttendanceSummary(data));
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [startDate, endDate, userProfile?.id]);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary-600" />
                    <h2 className="font-semibold text-slate-900 dark:text-white">Filter Tanggal</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Dari" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <Input label="Sampai" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
            </Card>

            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="text-center"><p className="text-2xl font-bold text-green-600">{summary.totalWorkDays}</p><p className="text-sm text-slate-500">Hari Kerja</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-purple-600">{summary.totalHolidays}</p><p className="text-sm text-slate-500">Libur</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-orange-600">{summary.totalSick + summary.totalLeave}</p><p className="text-sm text-slate-500">Izin/Sakit</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-red-600">{formatDuration(summary.totalDeficitMinutes)}</p><p className="text-sm text-slate-500">Total Defisit</p></Card>
                </div>
            )}

            <Card padding="none">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-white">Riwayat Absensi</h2>
                </div>
                {isLoading ? <LoadingSpinner className="py-12" /> : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {attendanceData.length === 0 ? (
                            <p className="text-center py-12 text-slate-500">Tidak ada data</p>
                        ) : attendanceData.map((row) => (
                            <div key={row.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{formatDateDisplay(row.date)}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                        {row.checkIn && <span><Clock className="w-3 h-3 inline mr-1" />{formatTime(row.checkIn)} - {row.checkOut ? formatTime(row.checkOut) : 'Belum pulang'}</span>}
                                        {row.durationMinutes > 0 && <span>{formatDuration(row.durationMinutes)}</span>}
                                    </div>
                                </div>
                                <StatusBadge status={row.status} />
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default HistoryPage;
