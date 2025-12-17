// Input Component
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    type = 'text',
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    type={inputType}
                    className={`
            w-full px-4 py-2.5 rounded-xl
            border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || isPassword ? 'pr-10' : ''}
            ${className}
          `}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}

                {rightIcon && !isPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        {rightIcon}
                    </div>
                )}
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

Input.displayName = 'Input';

export default Input;
