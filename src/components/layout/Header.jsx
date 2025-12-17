// Header Component
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';

const Header = ({ onMenuClick, title }) => {
    const { userProfile, isAdmin } = useAuth();
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();

    const handleNotificationClick = () => {
        if (isAdmin) {
            navigate('/admin/announcements');
        } else {
            navigate('/employee/announcements');
        }
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Search (Desktop) */}
                {isAdmin && (
                    <div className="hidden md:flex items-center">
                        {showSearch ? (
                            <div className="relative animate-fade-in">
                                <input
                                    type="text"
                                    placeholder="Cari karyawan..."
                                    className="w-64 px-4 py-2 pl-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    autoFocus
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <button
                                    onClick={() => setShowSearch(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Notifications - Click to go to announcements */}
                <button
                    onClick={handleNotificationClick}
                    className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Pengumuman"
                >
                    <Bell className="w-5 h-5" />
                    {/* Notification dot */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                    <Avatar
                        src={userProfile?.photoURL}
                        name={userProfile?.name}
                        size="sm"
                        showStatus
                        status="online"
                    />
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {userProfile?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {isAdmin ? 'Administrator' : userProfile?.position}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
