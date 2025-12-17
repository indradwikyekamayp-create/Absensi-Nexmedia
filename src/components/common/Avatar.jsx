// Avatar Component
import { getInitials, getAvatarColor } from '../../utils/formatters';

const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
};

const Avatar = ({
    src,
    name,
    size = 'md',
    className = '',
    showStatus = false,
    status = 'offline',
    ...props
}) => {
    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    const statusColors = {
        online: 'bg-green-500',
        busy: 'bg-red-500',
        away: 'bg-yellow-500',
        offline: 'bg-slate-400',
    };

    const statusSizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
        '2xl': 'w-5 h-5',
    };

    return (
        <div className={`relative inline-block ${className}`} {...props}>
            {src ? (
                <img
                    src={src}
                    alt={name || 'Avatar'}
                    className={`
            ${sizes[size]} 
            rounded-full object-cover 
            ring-2 ring-white dark:ring-slate-800
          `}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}

            <div
                className={`
          ${sizes[size]} 
          ${bgColor}
          rounded-full 
          flex items-center justify-center 
          text-white font-semibold
          ring-2 ring-white dark:ring-slate-800
          ${src ? 'hidden' : 'flex'}
        `}
            >
                {initials}
            </div>

            {showStatus && (
                <span
                    className={`
            absolute bottom-0 right-0 
            ${statusSizes[size]} 
            ${statusColors[status]}
            rounded-full 
            ring-2 ring-white dark:ring-slate-800
          `}
                />
            )}
        </div>
    );
};

// Avatar Group Component
export const AvatarGroup = ({ avatars = [], max = 4, size = 'md' }) => {
    const displayed = avatars.slice(0, max);
    const remaining = avatars.length - max;

    return (
        <div className="flex -space-x-2">
            {displayed.map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar.src}
                    name={avatar.name}
                    size={size}
                    className="ring-2 ring-white dark:ring-slate-800"
                />
            ))}

            {remaining > 0 && (
                <div
                    className={`
            ${sizes[size]}
            rounded-full 
            bg-slate-200 dark:bg-slate-700
            flex items-center justify-center 
            text-slate-600 dark:text-slate-300 
            font-medium
            ring-2 ring-white dark:ring-slate-800
          `}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
};

export default Avatar;
