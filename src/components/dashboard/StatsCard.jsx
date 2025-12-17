// Stats Card Component for Dashboard
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'primary',
    className = ''
}) => {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-700',
        green: 'from-green-500 to-emerald-700',
        blue: 'from-blue-500 to-indigo-700',
        red: 'from-red-500 to-rose-700',
        yellow: 'from-amber-400 to-orange-600',
        purple: 'from-purple-500 to-violet-700',
        gray: 'from-slate-400 to-slate-600',
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} p-5 text-white shadow-lg ${className}`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

            <div className="relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/80">{title}</p>
                        <p className="mt-2 text-3xl font-bold">{value}</p>
                    </div>

                    {Icon && (
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Icon className="w-6 h-6" />
                        </div>
                    )}
                </div>

                {trend && (
                    <div className="mt-4 flex items-center gap-1 text-sm">
                        {trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-300" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-300" />
                        )}
                        <span className={trend === 'up' ? 'text-green-300' : 'text-red-300'}>
                            {trendValue}
                        </span>
                        <span className="text-white/60">dari kemarin</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
