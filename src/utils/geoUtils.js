// Geolocation Utility Functions
import { OFFICE_LOCATION } from './constants';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Calculate distance from current location to office
 * Supports dynamic office location from settings
 */
export const getDistanceToOffice = (userLat, userLng, officeSettings = null) => {
    const officeLat = officeSettings?.latitude || OFFICE_LOCATION.lat;
    const officeLng = officeSettings?.longitude || OFFICE_LOCATION.lng;

    return calculateDistance(userLat, userLng, officeLat, officeLng);
};

/**
 * Check if user is within office radius
 * Supports dynamic office location and radius from settings
 */
export const isWithinOfficeRadius = (userLat, userLng, officeSettings = null) => {
    const distance = getDistanceToOffice(userLat, userLng, officeSettings);
    const radius = officeSettings?.radius || OFFICE_LOCATION.radius;
    return distance <= radius;
};

/**
 * Format distance for display
 */
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Get current position as a Promise
 */
export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung oleh browser ini'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                let message = 'Gagal mendapatkan lokasi';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Izin lokasi ditolak. Aktifkan GPS untuk melanjutkan.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Informasi lokasi tidak tersedia.';
                        break;
                    case error.TIMEOUT:
                        message = 'Waktu permintaan lokasi habis.';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
};

/**
 * Watch position with callback
 */
export const watchPosition = (onSuccess, onError) => {
    if (!navigator.geolocation) {
        onError(new Error('Geolocation tidak didukung'));
        return null;
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            onSuccess({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
            });
        },
        (error) => {
            onError(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
        }
    );

    return watchId;
};

/**
 * Clear position watch
 */
export const clearWatch = (watchId) => {
    if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
    }
};
