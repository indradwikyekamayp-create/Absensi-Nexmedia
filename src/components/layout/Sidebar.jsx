// Sidebar Component
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    Users,
    FileText,
    Bell,
    Settings,
    LogOut,
    Calendar,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun,
    KeyRound,
    X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../common/Avatar';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobile = false, onClose }) => {
    const { userProfile, logout, isAdmin } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const adminMenuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: ClipboardList, label: 'Rekapitulasi', path: '/admin/recap' },
        { icon: Users, label: 'Karyawan', path: '/admin/users' },
        { icon: Calendar, label: 'Revisi Absen', path: '/admin/manual-attendance' },
        { icon: Bell, label: 'Pengumuman', path: '/admin/announcements' },
        { icon: FileText, label: 'Laporan Gaji', path: '/admin/reports' },
        { icon: Settings, label: 'Pengaturan', path: '/admin/settings' },
    ];

    const employeeMenuItems = [
        { icon: Clock, label: 'Absensi', path: '/employee/attendance' },
        { icon: Calendar, label: 'Riwayat', path: '/employee/history' },
        { icon: Bell, label: 'Pengumuman', path: '/employee/announcements' },
        { icon: KeyRound, label: 'Ubah Password', path: '/employee/change-password' },
    ];

    const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200
        ${isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }
        ${isCollapsed && !isMobile ? 'justify-center' : ''}
      `}
        >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
                <span className="font-medium truncate">{item.label}</span>
            )}
        </NavLink>
    );

    return (
        <aside
            className={`
        ${isMobile
                    ? 'fixed inset-y-0 left-0 z-40 w-64'
                    : `relative ${isCollapsed ? 'w-20' : 'w-64'}`
                }
        flex flex-col
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-in-out
      `}
        >
            {/* Logo */}
            <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} p-4 border-b border-slate-200 dark:border-slate-800`}>
                {(!isCollapsed || isMobile) && (
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.jpg"
                            alt="NEX Media"
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <div>
                            <h1 className="font-bold text-slate-900 dark:text-white">NEX</h1>
                            <p className="text-xs text-slate-500">Attendance</p>
                        </div>
                    </div>
                )}

                {/* Close button for mobile */}
                {isMobile && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Collapse button for desktop */}
                {!isMobile && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
            text-slate-600 dark:text-slate-400 
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors
            ${isCollapsed && !isMobile ? 'justify-center' : ''}
          `}
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    {(!isCollapsed || isMobile) && (
                        <span className="font-medium">{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
                    )}
                </button>

                {/* User Info - Click to go to Profile */}
                <button
                    onClick={() => {
                        navigate(isAdmin ? '/admin/profile' : '/employee/profile');
                        if (isMobile && onClose) onClose();
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                >
                    <Avatar
                        src={userProfile?.photoURL}
                        name={userProfile?.name}
                        size="sm"
                    />
                    {(!isCollapsed || isMobile) && (
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {userProfile?.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {userProfile?.position || (isAdmin ? 'Admin' : 'Employee')}
                            </p>
                        </div>
                    )}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
            text-red-600 dark:text-red-400 
            hover:bg-red-50 dark:hover:bg-red-900/20
            transition-colors
            ${isCollapsed && !isMobile ? 'justify-center' : ''}
          `}
                >
                    <LogOut className="w-5 h-5" />
                    {(!isCollapsed || isMobile) && (
                        <span className="font-medium">Logout</span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
