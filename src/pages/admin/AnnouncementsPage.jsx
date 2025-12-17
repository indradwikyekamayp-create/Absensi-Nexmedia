// Admin Announcements Page
import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Image, File, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToAnnouncements, createAnnouncement, deleteAnnouncement } from '../../services/announcementService';
import { formatDateDisplay } from '../../utils/dateUtils';
import { formatFileSize } from '../../utils/formatters';

const AdminAnnouncementsPage = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToAnnouncements((data) => {
            setAnnouncements(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
            setFile(selectedFile);
        } else {
            setError('Ukuran file maksimal 5MB');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title || !content) { setError('Judul dan isi wajib diisi'); return; }
        try {
            setIsSubmitting(true);
            await createAnnouncement(user.uid, { title, content }, file);
            setSuccess('Pengumuman berhasil diposting!');
            setShowCreateModal(false);
            setTitle(''); setContent(''); setFile(null);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) { setError(err.message); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus?')) return;
        try {
            await deleteAnnouncement(id);
            setSuccess('Pengumuman dihapus');
        } catch (err) { setError(err.message); }
    };

    if (isLoading) return <LoadingSpinner size="lg" text="Memuat..." fullScreen />;

    return (
        <div className="space-y-6">
            {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl text-red-700">{error}</div>}
            {success && <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl text-green-700">{success}</div>}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengumuman</h1>
                <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>Buat Pengumuman</Button>
            </div>

            {announcements.length === 0 ? (
                <Card className="text-center py-12"><p className="text-slate-500">Belum ada pengumuman</p></Card>
            ) : (
                <div className="space-y-4">
                    {announcements.map((a) => (
                        <Card key={a.id}>
                            <div className="flex justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{a.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{a.createdAt?.toDate ? formatDateDisplay(a.createdAt.toDate()) : 'Baru'}</p>
                                    <p className="mt-3 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{a.content}</p>
                                    {a.attachmentURL && (
                                        <a href={a.attachmentURL} target="_blank" className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm">
                                            <FileText className="w-4 h-4" />{a.attachmentName || 'Lampiran'}
                                        </a>
                                    )}
                                </div>
                                <Button variant="ghost" onClick={() => handleDelete(a.id)} className="text-red-500"><Trash2 className="w-5 h-5" /></Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Pengumuman" size="md">
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input label="Judul" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full input" placeholder="Isi pengumuman..." required />
                    <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.png,.doc" />
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">Batal</Button>
                        <Button type="submit" isLoading={isSubmitting} className="flex-1">Posting</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminAnnouncementsPage;
