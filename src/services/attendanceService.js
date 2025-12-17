// Attendance Service - Firebase Firestore Operations
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { formatDateKey, getTodayKey, calculateDuration } from '../utils/dateUtils';
import { ATTENDANCE_STATUS } from '../utils/constants';

/**
 * Check in - Start work
 */
export const checkIn = async (userId, location, isWFH = false) => {
    try {
        const today = getTodayKey();
        const attendanceRef = doc(db, 'attendance', `${userId}_${today}`);

        // Check if already checked in
        const existing = await getDoc(attendanceRef);
        if (existing.exists() && existing.data().checkIn) {
            throw new Error('Anda sudah absen masuk hari ini');
        }

        const attendanceData = {
            userId,
            date: today,
            checkIn: Timestamp.now(),
            checkOut: null,
            checkInLocation: location,
            checkOutLocation: null,
            durationMinutes: 0,
            deficitMinutes: 0,
            status: ATTENDANCE_STATUS.WORKING,
            isWFH,
            notes: '',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isManualEntry: false,
            manualEntryBy: null
        };

        await setDoc(attendanceRef, attendanceData);
        return { id: attendanceRef.id, ...attendanceData };
    } catch (error) {
        console.error('Error checking in:', error);
        throw error;
    }
};

/**
 * Check out - End work
 */
export const checkOut = async (userId, location, targetMinutes, isPKBattle = false) => {
    try {
        const today = getTodayKey();
        const attendanceRef = doc(db, 'attendance', `${userId}_${today}`);

        const existing = await getDoc(attendanceRef);
        if (!existing.exists() || !existing.data().checkIn) {
            throw new Error('Anda belum absen masuk');
        }

        const data = existing.data();
        if (data.checkOut) {
            throw new Error('Anda sudah absen pulang');
        }

        const checkOutTime = Timestamp.now();
        const actualDuration = calculateDuration(data.checkIn, checkOutTime);

        let finalDuration = actualDuration;
        let deficitMinutes = 0;
        let status = ATTENDANCE_STATUS.COMPLETED;

        if (isPKBattle) {
            // PK Battle: Set duration to target, no deficit
            finalDuration = targetMinutes;
            deficitMinutes = 0;
            status = ATTENDANCE_STATUS.PK_BATTLE;
        } else if (actualDuration < targetMinutes) {
            // Early leave: Calculate deficit
            deficitMinutes = targetMinutes - actualDuration;
            status = ATTENDANCE_STATUS.EARLY_LEAVE;
        }

        const updateData = {
            checkOut: checkOutTime,
            checkOutLocation: location,
            durationMinutes: finalDuration,
            deficitMinutes,
            status,
            updatedAt: Timestamp.now()
        };

        await updateDoc(attendanceRef, updateData);
        return { id: attendanceRef.id, ...data, ...updateData };
    } catch (error) {
        console.error('Error checking out:', error);
        throw error;
    }
};

/**
 * Mark day as holiday/off
 */
export const markHoliday = async (userId, notes = 'Libur') => {
    try {
        const today = getTodayKey();
        const attendanceRef = doc(db, 'attendance', `${userId}_${today}`);

        const existing = await getDoc(attendanceRef);
        if (existing.exists()) {
            throw new Error('Sudah ada data absensi untuk hari ini');
        }

        const attendanceData = {
            userId,
            date: today,
            checkIn: null,
            checkOut: null,
            checkInLocation: null,
            checkOutLocation: null,
            durationMinutes: 0,
            deficitMinutes: 0,
            status: ATTENDANCE_STATUS.HOLIDAY,
            isWFH: false,
            notes,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isManualEntry: false,
            manualEntryBy: null
        };

        await setDoc(attendanceRef, attendanceData);
        return { id: attendanceRef.id, ...attendanceData };
    } catch (error) {
        console.error('Error marking holiday:', error);
        throw error;
    }
};

/**
 * Mark day as sick leave
 */
export const markSick = async (userId, notes = 'Sakit') => {
    try {
        const today = getTodayKey();
        const attendanceRef = doc(db, 'attendance', `${userId}_${today}`);

        const existing = await getDoc(attendanceRef);
        if (existing.exists()) {
            throw new Error('Sudah ada data absensi untuk hari ini');
        }

        const attendanceData = {
            userId,
            date: today,
            checkIn: null,
            checkOut: null,
            checkInLocation: null,
            checkOutLocation: null,
            durationMinutes: 0,
            deficitMinutes: 0,
            status: ATTENDANCE_STATUS.SICK,
            isWFH: false,
            notes,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isManualEntry: false,
            manualEntryBy: null
        };

        await setDoc(attendanceRef, attendanceData);
        return { id: attendanceRef.id, ...attendanceData };
    } catch (error) {
        console.error('Error marking sick:', error);
        throw error;
    }
};

/**
 * Mark day as leave (izin)
 */
export const markLeave = async (userId, notes = 'Izin') => {
    try {
        const today = getTodayKey();
        const attendanceRef = doc(db, 'attendance', `${userId}_${today}`);

        const existing = await getDoc(attendanceRef);
        if (existing.exists()) {
            throw new Error('Sudah ada data absensi untuk hari ini');
        }

        const attendanceData = {
            userId,
            date: today,
            checkIn: null,
            checkOut: null,
            checkInLocation: null,
            checkOutLocation: null,
            durationMinutes: 0,
            deficitMinutes: 0,
            status: ATTENDANCE_STATUS.LEAVE,
            isWFH: false,
            notes,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isManualEntry: false,
            manualEntryBy: null
        };

        await setDoc(attendanceRef, attendanceData);
        return { id: attendanceRef.id, ...attendanceData };
    } catch (error) {
        console.error('Error marking leave:', error);
        throw error;
    }
};

/**
 * Manual attendance entry (Admin only)
 */
export const createManualAttendance = async (adminId, data) => {
    try {
        const { userId, date, checkInTime, checkOutTime, status, notes } = data;
        const dateKey = formatDateKey(new Date(date));
        const attendanceRef = doc(db, 'attendance', `${userId}_${dateKey}`);

        // Calculate duration if both times provided
        let durationMinutes = 0;
        let checkIn = null;
        let checkOut = null;

        if (checkInTime) {
            const [hours, minutes] = checkInTime.split(':');
            const checkInDate = new Date(date);
            checkInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            checkIn = Timestamp.fromDate(checkInDate);
        }

        if (checkOutTime) {
            const [hours, minutes] = checkOutTime.split(':');
            const checkOutDate = new Date(date);
            checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            checkOut = Timestamp.fromDate(checkOutDate);

            if (checkIn) {
                durationMinutes = calculateDuration(checkIn, checkOut);
            }
        }

        const attendanceData = {
            userId,
            date: dateKey,
            checkIn,
            checkOut,
            checkInLocation: null,
            checkOutLocation: null,
            durationMinutes,
            deficitMinutes: 0,
            status: status || ATTENDANCE_STATUS.COMPLETED,
            isWFH: false,
            notes: notes || 'Input manual oleh admin',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isManualEntry: true,
            manualEntryBy: adminId
        };

        await setDoc(attendanceRef, attendanceData);
        return { id: attendanceRef.id, ...attendanceData };
    } catch (error) {
        console.error('Error creating manual attendance:', error);
        throw error;
    }
};

/**
 * Get today's attendance for a user
 */
export const getTodayAttendance = async (userId) => {
    try {
        const today = getTodayKey();
        const attendanceRef = doc(db, 'attendance', `${userId}_${today}`);
        const snapshot = await getDoc(attendanceRef);

        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting today attendance:', error);
        throw error;
    }
};

/**
 * Subscribe to today's attendance (real-time)
 */
export const subscribeToTodayAttendance = (userId, callback) => {
    const today = getTodayKey();
    const attendanceRef = doc(db, 'attendance', `${userId}_${today}`);

    return onSnapshot(attendanceRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() });
        } else {
            callback(null);
        }
    });
};

/**
 * Get attendance by date range
 */
export const getAttendanceByDateRange = async (startDate, endDate, userId = null) => {
    try {
        const startKey = formatDateKey(startDate);
        const endKey = formatDateKey(endDate);

        const attendanceRef = collection(db, 'attendance');
        const snapshot = await getDocs(attendanceRef);

        // Filter client-side to avoid composite index requirement
        let results = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(record => record.date >= startKey && record.date <= endKey);

        if (userId) {
            results = results.filter(record => record.userId === userId);
        }

        // Sort by date descending
        results.sort((a, b) => b.date.localeCompare(a.date));

        return results;
    } catch (error) {
        console.error('Error getting attendance by date range:', error);
        throw error;
    }
};

/**
 * Subscribe to all today's attendance (for admin dashboard)
 */
export const subscribeToAllTodayAttendance = (callback) => {
    const today = getTodayKey();
    const attendanceRef = collection(db, 'attendance');
    const q = query(
        attendanceRef,
        where('date', '==', today)
    );

    return onSnapshot(q, (snapshot) => {
        const attendances = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(attendances);
    });
};

/**
 * Calculate attendance summary for a user
 */
export const calculateAttendanceSummary = (attendanceData) => {
    const summary = {
        totalWorkDays: 0,
        totalHolidays: 0,
        totalSick: 0,
        totalLeave: 0,
        totalPKBattle: 0,
        totalEarlyLeave: 0,
        totalDeficitMinutes: 0,
        totalWorkMinutes: 0,
    };

    attendanceData.forEach(record => {
        switch (record.status) {
            case ATTENDANCE_STATUS.COMPLETED:
            case ATTENDANCE_STATUS.WORKING:
                summary.totalWorkDays++;
                summary.totalWorkMinutes += record.durationMinutes || 0;
                break;
            case ATTENDANCE_STATUS.PK_BATTLE:
                summary.totalWorkDays++;
                summary.totalPKBattle++;
                summary.totalWorkMinutes += record.durationMinutes || 0;
                break;
            case ATTENDANCE_STATUS.EARLY_LEAVE:
                summary.totalWorkDays++;
                summary.totalEarlyLeave++;
                summary.totalWorkMinutes += record.durationMinutes || 0;
                summary.totalDeficitMinutes += record.deficitMinutes || 0;
                break;
            case ATTENDANCE_STATUS.HOLIDAY:
                summary.totalHolidays++;
                break;
            case ATTENDANCE_STATUS.SICK:
                summary.totalSick++;
                break;
            case ATTENDANCE_STATUS.LEAVE:
                summary.totalLeave++;
                break;
        }
    });

    return summary;
};
