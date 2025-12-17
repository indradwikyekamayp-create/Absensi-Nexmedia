// Live Map Component using Leaflet
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import { OFFICE_LOCATION } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';

// Component to handle map invalidation
const MapInvalidator = () => {
    const map = useMap();

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);

    return null;
};

const LiveMap = ({
    employees = [],
    attendances = [],
    className = '',
    height = '400px'
}) => {
    const [mapReady, setMapReady] = useState(false);

    // Map attendances by userId
    const attendanceMap = attendances.reduce((acc, att) => {
        acc[att.userId] = att;
        return acc;
    }, {});

    // Get active employees with locations
    const activeEmployees = employees.filter(emp => {
        const att = attendanceMap[emp.id];
        return att && att.status === 'working' && att.checkInLocation;
    }).map(emp => ({
        ...emp,
        location: attendanceMap[emp.id].checkInLocation,
        status: attendanceMap[emp.id].status
    }));

    const statusColors = {
        working: '#22c55e',
        pk_battle: '#3b82f6',
    };

    useEffect(() => {
        setMapReady(true);
    }, []);

    if (!mapReady) {
        return (
            <div
                className={`bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse ${className}`}
                style={{ height }}
            />
        );
    }

    return (
        <div className={`rounded-xl overflow-hidden shadow-lg ${className}`} style={{ height }}>
            <MapContainer
                center={[OFFICE_LOCATION.lat, OFFICE_LOCATION.lng]}
                zoom={17}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <MapInvalidator />

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
                        color: '#4f46e5',
                        fillColor: '#6366f1',
                        fillOpacity: 0.15,
                        weight: 2,
                        dashArray: '5, 5'
                    }}
                />

                {/* Office Center Marker */}
                <CircleMarker
                    center={[OFFICE_LOCATION.lat, OFFICE_LOCATION.lng]}
                    radius={10}
                    pathOptions={{
                        color: '#4f46e5',
                        fillColor: '#4f46e5',
                        fillOpacity: 1,
                        weight: 3,
                    }}
                >
                    <Popup>
                        <div className="text-center">
                            <strong>Kantor NEX Media</strong>
                            <br />
                            <span className="text-sm text-gray-500">Titik Pusat Absensi</span>
                        </div>
                    </Popup>
                </CircleMarker>

                {/* Employee Markers */}
                {activeEmployees.map((emp) => (
                    <CircleMarker
                        key={emp.id}
                        center={[emp.location.lat, emp.location.lng]}
                        radius={8}
                        pathOptions={{
                            color: statusColors[emp.status] || '#22c55e',
                            fillColor: statusColors[emp.status] || '#22c55e',
                            fillOpacity: 0.8,
                            weight: 2,
                        }}
                    >
                        <Popup>
                            <div className="text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    {emp.photoURL ? (
                                        <img
                                            src={emp.photoURL}
                                            alt={emp.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                                            {emp.name?.charAt(0)}
                                        </div>
                                    )}
                                    <strong>{emp.name}</strong>
                                </div>
                                <span className="text-sm text-gray-500">{emp.position}</span>
                                <div className="mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 inline-block">
                                    Sedang Bekerja
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LiveMap;
