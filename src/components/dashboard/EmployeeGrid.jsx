// Employee Grid Component
import EmployeeCard from './EmployeeCard';
import { CardSkeleton } from '../common/LoadingSpinner';

const EmployeeGrid = ({
    employees = [],
    attendances = [],
    isLoading = false,
    onEmployeeClick,
}) => {
    // Map attendances by userId for quick lookup
    const attendanceMap = attendances.reduce((acc, att) => {
        acc[att.userId] = att;
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                    Tidak ada data karyawan
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((employee) => (
                <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    attendance={attendanceMap[employee.id]}
                    onClick={() => onEmployeeClick?.(employee)}
                />
            ))}
        </div>
    );
};

export default EmployeeGrid;
