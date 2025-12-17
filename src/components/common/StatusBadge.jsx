// Status Badge Component
import { ATTENDANCE_STATUS, STATUS_LABELS } from '../../utils/constants';

const statusStyles = {
    working: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ring-green-500/20',
    completed: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 ring-slate-500/20',
    pk_battle: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 ring-blue-500/20',
    early_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ring-yellow-500/20',
    holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 ring-purple-500/20',
    sick: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 ring-orange-500/20',
    leave: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 ring-cyan-500/20',
    absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 ring-red-500/20',
};

const StatusBadge = ({ status, size = 'md', className = '' }) => {
    const label = STATUS_LABELS[status] || status;
    const style = statusStyles[status] || statusStyles.completed;

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`
        inline-flex items-center font-medium rounded-full ring-1 ring-inset
        ${style}
        ${sizes[size]}
        ${className}
      `}
        >
            {label}
        </span>
    );
};

// Pulse Dot Indicator
export const PulseDot = ({ status, size = 'md', className = '' }) => {
    const dotColors = {
        working: 'bg-green-500',
        pk_battle: 'bg-blue-500',
        absent: 'bg-red-500',
        not_checked_in: 'bg-red-500',
        completed: 'bg-slate-400',
        done: 'bg-slate-400',
        sick: 'bg-orange-500',
        holiday: 'bg-purple-500',
        leave: 'bg-cyan-500',
    };

    const glowColors = {
        working: 'shadow-green-500/50',
        pk_battle: 'shadow-blue-500/50',
        absent: 'shadow-red-500/50',
        not_checked_in: 'shadow-red-500/50',
        sick: 'shadow-orange-500/50',
        holiday: 'shadow-purple-500/50',
        leave: 'shadow-cyan-500/50',
    };

    const sizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    };

    const color = dotColors[status] || dotColors.completed;
    const glow = glowColors[status] || '';
    const shouldPulse = ['working', 'pk_battle', 'sick', 'holiday', 'leave', 'not_checked_in', 'absent'].includes(status);

    return (
        <div className={`relative ${className}`}>
            {/* Outer pulsing ring */}
            {shouldPulse && (
                <span
                    className={`
                        absolute inset-0 ${sizes[size]} ${color} rounded-full
                        animate-ping opacity-75
                    `}
                    style={{ animationDuration: '1.5s' }}
                />
            )}
            {/* Inner glowing dot */}
            <span
                className={`
                    relative block ${sizes[size]} ${color} rounded-full
                    ${shouldPulse ? `shadow-lg ${glow}` : ''}
                `}
                style={shouldPulse ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : {}}
            />
        </div>
    );
};

// Position Badge
export const PositionBadge = ({ position, className = '' }) => {
    const positionColors = {
        'Host': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
        'Operator': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        'Backoffice': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        'Digital Marketing': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        'OB': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };

    return (
        <span
            className={`
        inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md
        ${positionColors[position] || positionColors['OB']}
        ${className}
      `}
        >
            {position}
        </span>
    );
};

export default StatusBadge;
