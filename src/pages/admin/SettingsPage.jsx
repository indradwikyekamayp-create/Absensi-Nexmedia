// Admin Settings Page - Office Location Configuration
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    MapPin,
    Search,
    Save,
    RotateCcw,
    Target,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
    getOfficeSettings,
    saveOfficeSettings,
    searchAddress,
    reverseGeocode
} from '../../services/settingsService';

// Custom marker icon
const officeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Draggable Marker Component
const DraggableMarker = ({ position, onPositionChange }) => {
    const markerRef = useRef(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const latlng = marker.getLatLng();
                onPositionChange(latlng.lat, latlng.lng);
            }
        },
    };

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={officeIcon}
        />
    );
};

// Map Click Handler
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Map Recenter Component
const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        latitude: -6.1383935,
        longitude: 106.7618308,
        radius: 100,
        address: ''
    });
    const [originalSettings, setOriginalSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getOfficeSettings();
                setSettings(data);
                setOriginalSettings(data);
            } catch (err) {
                setError('Gagal memuat pengaturan');
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    // Check for changes
    useEffect(() => {
        if (originalSettings) {
            const changed =
                settings.latitude !== originalSettings.latitude ||
                settings.longitude !== originalSettings.longitude ||
                settings.radius !== originalSettings.radius ||
                settings.address !== originalSettings.address;
            setHasChanges(changed);
        }
    }, [settings, originalSettings]);

    // Clear messages
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Handle position change (from drag or click)
    const handlePositionChange = useCallback(async (lat, lng) => {
        setSettings(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
        }));

        // Reverse geocode to get address
        try {
            const address = await reverseGeocode(lat, lng);
            setSettings(prev => ({ ...prev, address }));
        } catch (err) {
            console.error('Error getting address:', err);
        }
    }, []);

    // Handle address search
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setShowResults(true);
        try {
            const results = await searchAddress(searchQuery);
            setSearchResults(results);
        } catch (err) {
            setError('Gagal mencari alamat');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Select search result
    const selectAddress = (result) => {
        setSettings(prev => ({
            ...prev,
            latitude: result.latitude,
            longitude: result.longitude,
            address: result.displayName
        }));
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    // Handle save
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await saveOfficeSettings(settings);
            setOriginalSettings(settings);
            setSuccess('Pengaturan lokasi berhasil disimpan!');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle reset
    const handleReset = () => {
        if (originalSettings) {
            setSettings(originalSettings);
        }
    };

    // Get current location
    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    handlePositionChange(lat, lng);
                },
                (err) => {
                    setError('Gagal mendapatkan lokasi: ' + err.message);
                }
            );
        } else {
            setError('Geolocation tidak didukung browser ini');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Pengaturan Lokasi Kantor
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Atur titik koordinat dan radius untuk validasi absensi
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        disabled={!hasChanges || isSaving}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        isLoading={isSaving}
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        Simpan
                    </Button>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Panel */}
                <Card className="lg:col-span-1">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        Koordinat & Radius
                    </h2>

                    <div className="space-y-4">
                        {/* Address Search */}
                        <div className="relative">
                            <Input
                                label="Cari Alamat"
                                placeholder="Masukkan nama jalan atau tempat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                rightIcon={
                                    <button onClick={handleSearch} disabled={isSearching}>
                                        {isSearching ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4 cursor-pointer hover:text-primary-600" />
                                        )}
                                    </button>
                                }
                            />

                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            onClick={() => selectAddress(result)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                                        >
                                            <p className="text-sm text-slate-900 dark:text-white line-clamp-2">
                                                {result.displayName}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={handleGetCurrentLocation}
                            leftIcon={<Target className="w-4 h-4" />}
                        >
                            Gunakan Lokasi Saat Ini
                        </Button>

                        <hr className="border-slate-200 dark:border-slate-700" />

                        {/* Manual Coordinates */}
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Latitude"
                                type="number"
                                step="any"
                                value={settings.latitude}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    latitude: parseFloat(e.target.value) || 0
                                }))}
                            />
                            <Input
                                label="Longitude"
                                type="number"
                                step="any"
                                value={settings.longitude}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    longitude: parseFloat(e.target.value) || 0
                                }))}
                            />
                        </div>

                        {/* Radius */}
                        <div>
                            <Input
                                label="Radius (meter)"
                                type="number"
                                min="10"
                                max="1000"
                                value={settings.radius}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    radius: parseInt(e.target.value) || 100
                                }))}
                                helperText="Jarak maksimal dari titik kantor untuk absen"
                            />

                            {/* Radius Slider */}
                            <input
                                type="range"
                                min="10"
                                max="500"
                                value={settings.radius}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    radius: parseInt(e.target.value)
                                }))}
                                className="w-full mt-2 accent-primary-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>10m</span>
                                <span className="font-medium text-primary-600">{settings.radius}m</span>
                                <span>500m</span>
                            </div>
                        </div>

                        {/* Current Address */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Alamat Saat Ini
                            </label>
                            <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                {settings.address || 'Belum ada alamat'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Map */}
                <Card padding="none" className="lg:col-span-2 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Peta Lokasi Kantor
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Klik pada peta atau geser marker untuk mengubah lokasi
                        </p>
                    </div>

                    <div style={{ height: '500px' }}>
                        <MapContainer
                            center={[settings.latitude, settings.longitude]}
                            zoom={17}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <MapRecenter center={[settings.latitude, settings.longitude]} />
                            <MapClickHandler onMapClick={handlePositionChange} />

                            {/* Office Location Marker */}
                            <DraggableMarker
                                position={[settings.latitude, settings.longitude]}
                                onPositionChange={handlePositionChange}
                            />

                            {/* Radius Circle */}
                            <Circle
                                center={[settings.latitude, settings.longitude]}
                                radius={settings.radius}
                                pathOptions={{
                                    color: '#4338ca',
                                    fillColor: '#4338ca',
                                    fillOpacity: 0.2,
                                    weight: 2
                                }}
                            />
                        </MapContainer>
                    </div>

                    {/* Map Legend */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                <span className="text-slate-600 dark:text-slate-400">Titik Kantor</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-primary-500/30 border-2 border-primary-600 rounded-full"></div>
                                <span className="text-slate-600 dark:text-slate-400">Area Valid ({settings.radius}m)</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Info Card */}
            <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-primary-900 dark:text-primary-100">
                            Cara Mengatur Lokasi Kantor
                        </h3>
                        <ul className="text-sm text-primary-700 dark:text-primary-300 mt-2 space-y-1 list-disc list-inside">
                            <li><strong>Cari alamat</strong> - Ketik nama tempat di kolom pencarian</li>
                            <li><strong>Klik peta</strong> - Klik langsung pada peta untuk memindahkan titik</li>
                            <li><strong>Geser marker</strong> - Drag marker merah untuk posisi yang lebih akurat</li>
                            <li><strong>Atur radius</strong> - Gunakan slider untuk mengatur jarak validasi absen</li>
                            <li><strong>Simpan</strong> - Jangan lupa klik tombol Simpan setelah selesai</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;
