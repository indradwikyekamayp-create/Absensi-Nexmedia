// Attendance Map Component
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import { OFFICE_LOCATION } from '../../utils/constants';
import { formatDistance } from '../../utils/geoUtils';
import 'leaflet/dist/leaflet.css';

// Component to handle map updates
const MapUpdater = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], map.getZoom());
        }
    }, [center, map]);

    return null;
};

const AttendanceMap = ({
    userLocation,
    isWithinRadius,
    distance,
    className = '',
    height = '300px'
}) => {
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        setMapReady(true);
    }, []);

    const center = userLocation || { lat: OFFICE_LOCATION.lat, lng: OFFICE_LOCATION.lng };

    if (!mapReady) {
        return (
            <div
                className={`bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex items-center justify-center ${className}`}
                style={{ height }}
            >
                <span className="text-slate-400">Memuat peta...</span>
            </div>
        );
    }

    return (
        <div className={`rounded-xl overflow-hidden shadow-lg relative ${className}`} style={{ height }}>
            {/* Distance Badge */}
            {distance !== null && (
                <div className="absolute top-3 right-3 z-[1000] px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Jarak: <span className={isWithinRadius ? 'text-green-600' : 'text-red-600'}>
                            {formatDistance(distance)}
                        </span>
                    </span>
                </div>
            )}

            <MapContainer
                center={[center.lat, center.lng]}
                zoom={18}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
            >
                <MapUpdater center={userLocation} />

                {/* OpenStreetMap Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Office Radius Circle */}
                <Circle
                    center={[OFFICE_LOCATION.lat, OFFICE_LOCATION.lng]}
                    radius={OFFICE_LOCATION.radius}
                    pathOptions={{
                        color: isWithinRadius ? '#22c55e' : '#ef4444',
                        fillColor: isWithinRadius ? '#22c55e' : '#ef4444',
                        fillOpacity: 0.1,
                        weight: 2,
                    }}
                />

                {/* Office Center Marker */}
                <CircleMarker
                    center={[OFFICE_LOCATION.lat, OFFICE_LOCATION.lng]}
                    radius={8}
                    pathOptions={{
                        color: '#4f46e5',
                        fillColor: '#4f46e5',
                        fillOpacity: 1,
                        weight: 2,
                    }}
                >
                    <Popup>
                        <div className="text-center py-1">
                            <strong className="text-primary-600">Kantor NEX Media</strong>
                            <p className="text-xs text-gray-500 mt-1">Radius: {OFFICE_LOCATION.radius}m</p>
                        </div>
                    </Popup>
                </CircleMarker>

                {/* User Location Marker */}
                {userLocation && (
                    <CircleMarker
                        center={[userLocation.lat, userLocation.lng]}
                        radius={10}
                        pathOptions={{
                            color: isWithinRadius ? '#22c55e' : '#ef4444',
                            fillColor: isWithinRadius ? '#22c55e' : '#ef4444',
                            fillOpacity: 0.8,
                            weight: 3,
                        }}
                    >
                        <Popup>
                            <div className="text-center py-1">
                                <strong>Lokasi Anda</strong>
                                <p className={`text-xs mt-1 ${isWithinRadius ? 'text-green-600' : 'text-red-600'}`}>
                                    {isWithinRadius ? '✓ Dalam area kantor' : '✗ Di luar area kantor'}
                                </p>
                            </div>
                        </Popup>
                    </CircleMarker>
                )}
            </MapContainer>
        </div>
    );
};

export default AttendanceMap;
