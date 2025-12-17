// Employee Layout Component
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
    '/employee/attendance': 'Absensi',
    '/employee/history': 'Riwayat Absensi',
    '/employee/announcements': 'Pengumuman',
    '/employee/change-password': 'Ubah Password',
    '/employee/profile': 'Profil',
};

const EmployeeLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation();

    const currentTitle = pageTitles[location.pathname] || 'Absensi';

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    // Handle close mobile sidebar
    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    // Handle open mobile sidebar
    const openMobileSidebar = () => {
        setIsMobileSidebarOpen(true);
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-dark-bg overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block h-full">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`
                    fixed inset-0 z-40 bg-black/50 lg:hidden
                    transition-opacity duration-300
                    ${isMobileSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
                `}
                onClick={closeMobileSidebar}
            />

            {/* Mobile Sidebar */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 lg:hidden
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <Sidebar
                    isMobile={true}
                    onClose={closeMobileSidebar}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                    onMenuClick={openMobileSidebar}
                    title={currentTitle}
                />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;
