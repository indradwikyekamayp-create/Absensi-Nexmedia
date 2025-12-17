// User Service - Firebase Auth Management
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    deleteUser,
    signOut
} from 'firebase/auth';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { auth, db, functions } from './firebase';
import { WORK_HOURS_BY_POSITION } from '../utils/constants';

// Firebase config for secondary app
const firebaseConfig = {
    apiKey: "AIzaSyBxJLJHCT0bSeOPUE0Makcf6xKTz_1Qf0k",
    authDomain: "absensi-1c615.firebaseapp.com",
    projectId: "absensi-1c615",
    storageBucket: "absensi-1c615.firebasestorage.app",
    messagingSenderId: "485062649654",
    appId: "1:485062649654:web:d80251aa6476a041453597",
};

/**
 * Create a new user (Admin only)
 * Uses secondary Firebase app to avoid logging out admin
 */
export const createUser = async (userData) => {
    // Initialize secondary app for user creation
    let secondaryApp = null;

    try {
        // Try Cloud Function first
        try {
            const createUserFunction = httpsCallable(functions, 'createUser');
            const result = await createUserFunction({
                email: userData.email,
                password: userData.password,
                name: userData.name,
                position: userData.position,
                role: userData.role || 'employee',
                workHoursTarget: userData.workHoursTarget || WORK_HOURS_BY_POSITION[userData.position] || 8,
            });
            return result.data;
        } catch (cfError) {
            console.warn('Cloud Function not available, using fallback:', cfError.message);

            // Fallback: Create user using secondary Firebase app
            // This prevents logging out the current admin user
            secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                userData.email,
                userData.password
            );

            // Create user document in Firestore
            await setDoc(doc(db, 'user', userCredential.user.uid), {
                email: userData.email,
                name: userData.name,
                position: userData.position,
                role: userData.role || 'employee',
                workHoursTarget: userData.workHoursTarget || WORK_HOURS_BY_POSITION[userData.position] || 8,
                photoURL: null,
                createdAt: new Date(),
                isActive: true
            });

            // Sign out from secondary app and delete it
            await signOut(secondaryAuth);
            await deleteApp(secondaryApp);

            return { success: true, uid: userCredential.user.uid };
        }
    } catch (error) {
        // Clean up secondary app on error
        if (secondaryApp) {
            try {
                await deleteApp(secondaryApp);
            } catch (e) {
                console.warn('Error deleting secondary app:', e);
            }
        }
        console.error('Error creating user:', error);
        throw new Error(error.message || 'Gagal membuat akun');
    }
};

/**
 * Send password reset email
 */
export const resetUserPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (error) {
        console.error('Error resetting password:', error);
        throw new Error('Gagal mengirim email reset password');
    }
};

/**
 * Get all users
 */
export const getUsers = async () => {
    try {
        const usersRef = collection(db, 'user');
        const snapshot = await getDocs(usersRef);

        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort by name client-side to avoid index requirement
        users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return users;
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
};

/**
 * Get users with real-time updates
 */
export const subscribeToUsers = (callback) => {
    const usersRef = collection(db, 'user');

    return onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Sort by name client-side
        users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        callback(users);
    });
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'user', userId));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};

/**
 * Update user profile
 */
export const updateUser = async (userId, data) => {
    try {
        const userRef = doc(db, 'user', userId);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

/**
 * Deactivate user (soft delete)
 */
export const deactivateUser = async (userId) => {
    try {
        const userRef = doc(db, 'user', userId);
        await updateDoc(userRef, {
            isActive: false,
            deactivatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error deactivating user:', error);
        throw error;
    }
};

/**
 * Reactivate user
 */
export const reactivateUser = async (userId) => {
    try {
        const userRef = doc(db, 'user', userId);
        await updateDoc(userRef, {
            isActive: true,
            reactivatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error reactivating user:', error);
        throw error;
    }
};

/**
 * Get employees only (non-admin)
 */
export const getEmployees = async () => {
    try {
        const usersRef = collection(db, 'user');
        const snapshot = await getDocs(usersRef);

        const employees = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => user.role === 'employee' && user.isActive !== false);

        // Sort by name client-side
        employees.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return employees;
    } catch (error) {
        console.error('Error getting employees:', error);
        throw error;
    }
};

/**
 * Get employees by position
 */
export const getEmployeesByPosition = async (position) => {
    try {
        const usersRef = collection(db, 'user');
        const snapshot = await getDocs(usersRef);

        const employees = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user =>
                user.role === 'employee' &&
                user.position === position &&
                user.isActive !== false
            );

        return employees;
    } catch (error) {
        console.error('Error getting employees by position:', error);
        throw error;
    }
};
