// Authentication Context
import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'user', uid));
            if (userDoc.exists()) {
                const profile = { id: userDoc.id, ...userDoc.data() };
                setUserProfile(profile);
                return profile;
            }
            return null;
        } catch (err) {
            console.error('Error fetching user profile:', err);
            return null;
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await fetchUserProfile(firebaseUser.uid);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Login
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const result = await signInWithEmailAndPassword(auth, email, password);
            const profile = await fetchUserProfile(result.user.uid);

            if (!profile) {
                await signOut(auth);
                throw new Error('Akun tidak ditemukan dalam sistem');
            }

            if (!profile.isActive) {
                await signOut(auth);
                throw new Error('Akun Anda telah dinonaktifkan');
            }

            return profile;
        } catch (err) {
            let message = 'Email atau password salah';
            if (err.code === 'auth/user-not-found') {
                message = 'Email tidak terdaftar';
            } else if (err.code === 'auth/wrong-password') {
                message = 'Password salah';
            } else if (err.code === 'auth/too-many-requests') {
                message = 'Terlalu banyak percobaan. Coba lagi nanti.';
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
        } catch (err) {
            console.error('Logout error:', err);
            throw err;
        }
    };

    // Change password (for employees)
    const changePassword = async (currentPassword, newPassword) => {
        try {
            if (!user) throw new Error('Tidak ada user yang login');

            // Re-authenticate first
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            return true;
        } catch (err) {
            let message = 'Gagal mengubah password';
            if (err.code === 'auth/wrong-password') {
                message = 'Password lama salah';
            } else if (err.code === 'auth/weak-password') {
                message = 'Password baru terlalu lemah (minimal 6 karakter)';
            }
            throw new Error(message);
        }
    };

    // Check if user is admin
    const isAdmin = userProfile?.role === ROLES.ADMIN;

    // Refresh user profile
    const refreshProfile = async () => {
        if (user) {
            await fetchUserProfile(user.uid);
        }
    };

    const value = {
        user,
        userProfile,
        loading,
        error,
        login,
        logout,
        changePassword,
        isAdmin,
        refreshProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
