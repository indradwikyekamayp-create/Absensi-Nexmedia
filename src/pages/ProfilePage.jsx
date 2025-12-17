// Profile Page - Update user profile and photo
import { useState, useRef } from 'react';
import { Camera, User, Mail, Briefcase, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { updateUser } from '../services/userService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

const ProfilePage = () => {
    const { userProfile, refreshProfile } = useAuth();
    const fileInputRef = useRef(null);

    const [name, setName] = useState(userProfile?.name || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Ukuran file maksimal 2MB');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
    };

    // Handle photo upload
    const handleUploadPhoto = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            setError('');

            const timestamp = Date.now();
            const fileName = `${userProfile.id}_${timestamp}.${selectedFile.name.split('.').pop()}`;
            const storageRef = ref(storage, `avatars/${fileName}`);

            await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(storageRef);

            // Update user profile with new photo URL
            await updateUser(userProfile.id, { photoURL: downloadURL });

            // Refresh the user profile
            if (refreshProfile) {
                await refreshProfile();
            }

            setSuccess('Foto profil berhasil diperbarui!');
            setSelectedFile(null);
            setPreviewUrl(null);

            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('Error uploading photo:', err);
            setError('Gagal mengunggah foto: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle profile update
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Nama tidak boleh kosong');
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            await updateUser(userProfile.id, { name: name.trim() });

            // Refresh the user profile
            if (refreshProfile) {
                await refreshProfile();
            }

            setSuccess('Profil berhasil diperbarui!');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Gagal menyimpan profil: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profil Saya</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Kelola informasi profil dan foto Anda
                </p>
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

            {/* Photo Upload Card */}
            <Card>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary-600" />
                    Foto Profil
                </h2>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar Preview */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Avatar
                                    src={userProfile?.photoURL}
                                    name={userProfile?.name}
                                    size="xl"
                                    className="w-full h-full"
                                />
                            )}
                        </div>

                        {/* Camera overlay */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 text-center sm:text-left">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Klik ikon kamera untuk memilih foto baru
                        </p>
                        <p className="text-xs text-slate-500 mb-4">
                            Format: JPG, PNG. Maksimal 2MB
                        </p>

                        {selectedFile && (
                            <div className="space-y-2">
                                <p className="text-sm text-primary-600 dark:text-primary-400">
                                    File terpilih: {selectedFile.name}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleUploadPhoto}
                                        isLoading={isUploading}
                                        size="sm"
                                    >
                                        Upload Foto
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        size="sm"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Profile Info Card */}
            <Card>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Informasi Profil
                </h2>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <Input
                        label="Nama Lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        leftIcon={<User className="w-4 h-4" />}
                        placeholder="Masukkan nama lengkap"
                    />

                    <Input
                        label="Email"
                        value={userProfile?.email || ''}
                        leftIcon={<Mail className="w-4 h-4" />}
                        disabled
                        helperText="Email tidak dapat diubah"
                    />

                    <Input
                        label="Jabatan"
                        value={userProfile?.position || userProfile?.role || ''}
                        leftIcon={<Briefcase className="w-4 h-4" />}
                        disabled
                        helperText="Hubungi admin untuk mengubah jabatan"
                    />

                    <div className="pt-4">
                        <Button
                            type="submit"
                            isLoading={isSaving}
                            leftIcon={<Save className="w-4 h-4" />}
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProfilePage;
