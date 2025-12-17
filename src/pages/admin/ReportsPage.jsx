// Admin Reports Page - Salary & Allowance Report
import { useState, useEffect } from 'react';
import { Download, Calendar, DollarSign, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getUsers } from '../../services/userService';
import { getAttendanceByDateRange, calculateAttendanceSummary } from '../../services/attendanceService';
import { getCutoffPeriod, formatCutoffLabel, formatDuration } from '../../utils/dateUtils';
import { SALARY_RULES } from '../../utils/constants';

const ReportsPage = () => {
    const [employees, setEmployees] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const users = await getUsers();
                const emps = users.filter(u => u.role === 'employee' && u.isActive !== false);
                setEmployees(emps);

                const refDate = new Date(selectedYear, selectedMonth, 15);
                const { startDate, endDate } = getCutoffPeriod(refDate);

                const reports = await Promise.all(emps.map(async (emp) => {
                    const attendance = await getAttendanceByDateRange(startDate, endDate, emp.id);
                    const summary = calculateAttendanceSummary(attendance);

                    const paidSick = Math.min(summary.totalSick, SALARY_RULES.MAX_PAID_SICK_DAYS);
                    const unpaidSick = Math.max(summary.totalSick - SALARY_RULES.MAX_PAID_SICK_DAYS, 0);
                    const totalDeductions = summary.totalLeave + unpaidSick;
                    const isEligible = summary.totalAbsent === 0 && totalDeductions <= SALARY_RULES.MAX_UNPAID_DEDUCTIONS;

                    return { ...emp, summary, paidSick, unpaidSick, totalDeductions, isEligible };
                }));

                setReportData(reports);
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [selectedMonth, selectedYear]);

    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        .map((m, i) => ({ value: i, label: m }));
    const years = [2024, 2025, 2026].map(y => ({ value: y, label: y.toString() }));

    if (isLoading) return <LoadingSpinner size="lg" text="Generating report..." fullScreen />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Laporan Gaji</h1>
                <div className="flex gap-3">
                    <Select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} options={months} />
                    <Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} options={years} />
                </div>
            </div>

            <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-200">Periode Cutoff</p>
                        <p className="text-2xl font-bold">{formatCutoffLabel(new Date(selectedYear, selectedMonth, 15))}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-primary-200" />
                </div>
            </Card>

            <div className="overflow-x-auto">
                <table className="w-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Hari Kerja</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Sakit (Paid)</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Izin</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Defisit</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Allowance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {reportData.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{emp.name}</td>
                                <td className="px-4 py-3 text-center">{emp.summary.totalWorkDays}</td>
                                <td className="px-4 py-3 text-center">{emp.paidSick}</td>
                                <td className="px-4 py-3 text-center">{emp.summary.totalLeave + emp.unpaidSick}</td>
                                <td className="px-4 py-3 text-center text-red-600">{formatDuration(emp.summary.totalDeficitMinutes)}</td>
                                <td className="px-4 py-3 text-center">
                                    {emp.isEligible ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                            <CheckCircle className="w-3 h-3" /> Eligible
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                            <XCircle className="w-3 h-3" /> Not Eligible
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsPage;
