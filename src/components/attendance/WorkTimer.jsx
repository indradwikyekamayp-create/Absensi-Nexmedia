// Work Timer Component
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getElapsedMinutes } from '../../utils/dateUtils';

const WorkTimer = ({ checkInTime, targetMinutes = 420 }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!checkInTime) return;

        const updateTimer = () => {
            const minutes = getElapsedMinutes(checkInTime);
            setElapsed(minutes);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000); // Update every second for smooth display

        return () => clearInterval(interval);
    }, [checkInTime]);

    const hours = Math.floor(elapsed / 60);
    const minutes = Math.floor(elapsed % 60);
    const seconds = Math.floor((Date.now() - (checkInTime?.toDate?.() || new Date(checkInTime)).getTime()) / 1000) % 60;

    const progress = Math.min((elapsed / targetMinutes) * 100, 100);
    const isComplete = elapsed >= targetMinutes;

    const formatNumber = (num) => num.toString().padStart(2, '0');

    return (
        <div className="text-center">
            {/* Timer Display */}
            <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <Clock className={`w-6 h-6 ${isComplete ? 'text-green-500' : 'text-primary-500'}`} />
                    <span className={`text-4xl font-mono font-bold tracking-wider ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                        {formatNumber(hours)}:{formatNumber(minutes)}:{formatNumber(seconds)}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isComplete
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-primary-500 to-primary-600'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Progress Label */}
                <div className="flex justify-between mt-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                        Target: {Math.floor(targetMinutes / 60)} jam
                    </span>
                    <span className={`font-medium ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400'}`}>
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>

            {/* Status Message */}
            {isComplete && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-green-700 dark:text-green-400 font-medium">
                        ✓ Target jam kerja tercapai!
                    </p>
                </div>
            )}
        </div>
    );
};

export default WorkTimer;
