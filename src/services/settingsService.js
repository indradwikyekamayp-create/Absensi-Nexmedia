// Settings Service - Manage application settings in Firestore
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { OFFICE_LOCATION } from '../utils/constants';

const SETTINGS_DOC_ID = 'office_location';

/**
 * Get office location settings
 */
export const getOfficeSettings = async () => {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        const snapshot = await getDoc(settingsRef);

        if (snapshot.exists()) {
            return snapshot.data();
        }

        // Return defaults if not set
        return {
            latitude: OFFICE_LOCATION.lat,
            longitude: OFFICE_LOCATION.lng,
            radius: OFFICE_LOCATION.radius,
            address: 'NEX Media Indonesia',
            updatedAt: null
        };
    } catch (error) {
        console.error('Error getting office settings:', error);
        // Return defaults on error
        return {
            latitude: OFFICE_LOCATION.lat,
            longitude: OFFICE_LOCATION.lng,
            radius: OFFICE_LOCATION.radius,
            address: 'NEX Media Indonesia',
            updatedAt: null
        };
    }
};

/**
 * Save office location settings
 */
export const saveOfficeSettings = async (settings) => {
    try {
        const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
        await setDoc(settingsRef, {
            ...settings,
            updatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error saving office settings:', error);
        throw new Error('Gagal menyimpan pengaturan lokasi');
    }
};

/**
 * Subscribe to office settings (real-time)
 */
export const subscribeToOfficeSettings = (callback) => {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);

    return onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data());
        } else {
            callback({
                latitude: OFFICE_LOCATION.lat,
                longitude: OFFICE_LOCATION.lng,
                radius: OFFICE_LOCATION.radius,
                address: 'NEX Media Indonesia',
                updatedAt: null
            });
        }
    });
};

/**
 * Search address using OpenStreetMap Nominatim API (free)
 */
export const searchAddress = async (query) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
            {
                headers: {
                    'Accept-Language': 'id',
                    'User-Agent': 'NexAttendanceApp/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Gagal mencari alamat');
        }

        const results = await response.json();
        return results.map(item => ({
            displayName: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon)
        }));
    } catch (error) {
        console.error('Error searching address:', error);
        throw error;
    }
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'Accept-Language': 'id',
                    'User-Agent': 'NexAttendanceApp/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Gagal mendapatkan alamat');
        }

        const result = await response.json();
        return result.display_name || 'Alamat tidak ditemukan';
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return 'Alamat tidak ditemukan';
    }
};
