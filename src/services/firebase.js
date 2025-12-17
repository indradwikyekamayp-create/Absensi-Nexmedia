// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyBxJLJHCT0bSeOPUE0Makcf6xKTz_1Qf0k",
    authDomain: "absensi-1c615.firebaseapp.com",
    projectId: "absensi-1c615",
    storageBucket: "absensi-1c615.firebasestorage.app",
    messagingSenderId: "485062649654",
    appId: "1:485062649654:web:d80251aa6476a041453597",
    measurementId: "G-8L4HYT8TYP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'asia-southeast2');

export default app;
