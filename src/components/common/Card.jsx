// Card Component
const Card = ({
    children,
    className = '',
    padding = 'md',
    hover = false,
    glass = false,
    gradient = false,
    ...props
}) => {
    const paddingSizes = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
        xl: 'p-8',
    };

    return (
        <div
            className={`
        rounded-2xl border border-slate-200 dark:border-slate-700
        ${glass
                    ? 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg'
                    : gradient
                        ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900'
                        : 'bg-white dark:bg-slate-800'
                }
        ${paddingSizes[padding]}
        ${hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-300 dark:hover:border-primary-700' : 'shadow-sm'}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

// Card Header Sub-component
Card.Header = ({ children, className = '', ...props }) => (
    <div
        className={`flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 ${className}`}
        {...props}
    >
        {children}
    </div>
);

// Card Title Sub-component
Card.Title = ({ children, className = '', ...props }) => (
    <h3
        className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${className}`}
        {...props}
    >
        {children}
    </h3>
);

// Card Body Sub-component
Card.Body = ({ children, className = '', ...props }) => (
    <div className={`${className}`} {...props}>
        {children}
    </div>
);

// Card Footer Sub-component
Card.Footer = ({ children, className = '', ...props }) => (
    <div
        className={`pt-4 border-t border-slate-200 dark:border-slate-700 ${className}`}
        {...props}
    >
        {children}
    </div>
);

export default Card;
