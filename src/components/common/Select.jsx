// Select Component
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Pilih...',
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    ref={ref}
                    className={`
            w-full px-4 py-2.5 rounded-xl appearance-none
            border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-slate-100
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            pr-10
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            {helperText && !error && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
