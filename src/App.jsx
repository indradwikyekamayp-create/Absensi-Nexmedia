// Main App Component with Routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import RecapPage from './pages/admin/RecapPage';
import UsersPage from './pages/admin/UsersPage';
import ManualAttendancePage from './pages/admin/ManualAttendancePage';
import AdminAnnouncementsPage from './pages/admin/AnnouncementsPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import AttendancePage from './pages/employee/AttendancePage';
import HistoryPage from './pages/employee/HistoryPage';
import EmployeeAnnouncementsPage from './pages/employee/AnnouncementsPage';
import ChangePasswordPage from './pages/employee/ChangePasswordPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner size="lg" text="Memuat..." fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && userProfile?.role !== requiredRole) {
        return <Navigate to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/employee/attendance'} replace />;
    }

    return children;
};

// Auth Route - Redirect if already logged in
const AuthRoute = ({ children }) => {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner size="lg" text="Memuat..." fullScreen />;
    }

    if (user && userProfile) {
        return <Navigate to={userProfile.role === 'admin' ? '/admin/dashboard' : '/employee/attendance'} replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="recap" element={<RecapPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="manual-attendance" element={<ManualAttendancePage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Employee Routes */}
            <Route path="/employee" element={<ProtectedRoute requiredRole="employee"><EmployeeLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/employee/attendance" replace />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="announcements" element={<EmployeeAnnouncementsPage />} />
                <Route path="change-password" element={<ChangePasswordPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
