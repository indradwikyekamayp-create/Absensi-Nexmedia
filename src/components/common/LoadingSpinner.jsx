// Loading Spinner Component
const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
};

const LoadingSpinner = ({
    size = 'md',
    className = '',
    text = '',
    fullScreen = false,
}) => {
    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`
          ${sizes[size]}
          rounded-full
          border-primary-200 dark:border-primary-900
          border-t-primary-600 dark:border-t-primary-400
          animate-spin
        `}
            />
            {text && (
                <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    return spinner;
};

// Skeleton loader for cards
export const CardSkeleton = ({ className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-5 ${className}`}>
        <div className="space-y-4">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-20 w-full rounded-lg" />
        </div>
    </div>
);

// Skeleton loader for table rows
export const TableRowSkeleton = ({ columns = 5 }) => (
    <tr className="border-t border-slate-200 dark:border-slate-700">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="skeleton h-4 w-full rounded" />
            </td>
        ))}
    </tr>
);

export default LoadingSpinner;
