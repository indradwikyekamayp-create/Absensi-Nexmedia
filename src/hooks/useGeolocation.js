// Custom hook for geolocation
import { useState, useEffect, useCallback } from 'react';
import { getCurrentPosition, getDistanceToOffice, isWithinOfficeRadius } from '../utils/geoUtils';

const useGeolocation = (options = {}) => {
    const { enableWatch = false, onLocationChange } = options;

    const [location, setLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [isWithinRadius, setIsWithinRadius] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch location
    const fetchLocation = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const position = await getCurrentPosition();
            setLocation(position);

            // Calculate distance to office
            const dist = getDistanceToOffice(position.lat, position.lng);
            setDistance(dist);

            // Check if within radius
            const withinRadius = isWithinOfficeRadius(position.lat, position.lng);
            setIsWithinRadius(withinRadius);

            if (onLocationChange) {
                onLocationChange(position, dist, withinRadius);
            }

            return { position, distance: dist, isWithinRadius: withinRadius };
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [onLocationChange]);

    // Initial fetch
    useEffect(() => {
        fetchLocation();
    }, []);

    // Watch position if enabled
    useEffect(() => {
        if (!enableWatch) return;

        let watchId = null;

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    };

                    setLocation(pos);

                    const dist = getDistanceToOffice(pos.lat, pos.lng);
                    setDistance(dist);

                    const withinRadius = isWithinOfficeRadius(pos.lat, pos.lng);
                    setIsWithinRadius(withinRadius);

                    if (onLocationChange) {
                        onLocationChange(pos, dist, withinRadius);
                    }
                },
                (err) => {
                    setError(err.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 5000,
                }
            );
        }

        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [enableWatch, onLocationChange]);

    // Refresh location manually
    const refresh = useCallback(() => {
        return fetchLocation();
    }, [fetchLocation]);

    return {
        location,
        distance,
        isWithinRadius,
        error,
        isLoading,
        refresh,
    };
};

export default useGeolocation;
