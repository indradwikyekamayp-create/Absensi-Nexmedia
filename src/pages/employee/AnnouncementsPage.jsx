// Employee Announcements Page with Sound Notification
import { useState, useEffect, useRef } from 'react';
import { Bell, FileText, Clock, Download, Volume2 } from 'lucide-react';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { subscribeToAnnouncements } from '../../services/announcementService';
import { formatDateDisplay } from '../../utils/dateUtils';

const EmployeeAnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Enable audio after first interaction
        const handleInteraction = () => setHasInteracted(true);
        document.addEventListener('click', handleInteraction, { once: true });
        return () => document.removeEventListener('click', handleInteraction);
    }, []);

    useEffect(() => {
        const playSound = () => {
            if (hasInteracted && audioRef.current) {
                audioRef.current.play().catch(console.error);
            }
        };

        const unsubscribe = subscribeToAnnouncements(
            (data) => { setAnnouncements(data); setIsLoading(false); },
            () => playSound()
        );
        return () => unsubscribe();
    }, [hasInteracted]);

    if (isLoading) return <LoadingSpinner size="lg" text="Memuat pengumuman..." fullScreen />;

    return (
        <div className="space-y-6">
            <audio ref={audioRef} src="/notification.mp3" preload="auto" />

            <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengumuman</h1>
            </div>

            {!hasInteracted && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                    <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">Klik di mana saja untuk mengaktifkan notifikasi suara</p>
                    </div>
                </Card>
            )}

            {announcements.length === 0 ? (
                <Card className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Belum ada pengumuman</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {announcements.map((a) => (
                        <Card key={a.id} hover>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{a.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <Clock className="w-4 h-4" />
                                {a.createdAt?.toDate ? formatDateDisplay(a.createdAt.toDate()) : 'Baru'}
                            </div>
                            <p className="mt-3 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{a.content}</p>
                            {a.attachmentURL && (
                                <a href={a.attachmentURL} target="_blank" rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 transition-colors">
                                    <Download className="w-4 h-4" />{a.attachmentName || 'Download Lampiran'}
                                </a>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeAnnouncementsPage;
