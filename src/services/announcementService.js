// Announcement Service - Firebase Firestore & Storage Operations
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';

/**
 * Create a new announcement
 */
export const createAnnouncement = async (adminId, data, file = null) => {
    try {
        let attachmentURL = null;
        let attachmentName = null;

        // Upload file if provided
        if (file) {
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `announcements/${fileName}`);

            await uploadBytes(storageRef, file);
            attachmentURL = await getDownloadURL(storageRef);
            attachmentName = file.name;
        }

        const announcementData = {
            title: data.title,
            content: data.content,
            attachmentURL,
            attachmentName,
            createdBy: adminId,
            createdAt: Timestamp.now(),
            isActive: true
        };

        const docRef = await addDoc(collection(db, 'announcements'), announcementData);
        return { id: docRef.id, ...announcementData };
    } catch (error) {
        console.error('Error creating announcement:', error);
        throw new Error('Gagal membuat pengumuman');
    }
};

/**
 * Get all active announcements
 */
export const getAnnouncements = async () => {
    try {
        const announcementsRef = collection(db, 'announcements');
        const q = query(
            announcementsRef,
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(ann => ann.isActive !== false);
    } catch (error) {
        console.error('Error getting announcements:', error);
        throw error;
    }
};

/**
 * Subscribe to announcements (real-time)
 */
export const subscribeToAnnouncements = (callback, onNewAnnouncement = null) => {
    const announcementsRef = collection(db, 'announcements');
    const q = query(
        announcementsRef,
        orderBy('createdAt', 'desc')
    );

    let isInitialLoad = true;

    return onSnapshot(q, (snapshot) => {
        const announcements = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(ann => ann.isActive !== false);

        // Check for new announcements (after initial load)
        if (!isInitialLoad && onNewAnnouncement) {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    onNewAnnouncement(change.doc.data());
                }
            });
        }

        isInitialLoad = false;
        callback(announcements);
    });
};

/**
 * Delete announcement (soft delete)
 */
export const deleteAnnouncement = async (announcementId) => {
    try {
        const announcementRef = doc(db, 'announcements', announcementId);
        const snapshot = await getDoc(announcementRef);

        if (!snapshot.exists()) {
            throw new Error('Pengumuman tidak ditemukan');
        }

        const data = snapshot.data();

        // Delete attachment from storage if exists
        if (data.attachmentURL) {
            try {
                // Extract file path from URL
                const urlParts = data.attachmentURL.split('/');
                const encodedFileName = urlParts[urlParts.length - 1].split('?')[0];
                const fileName = decodeURIComponent(encodedFileName);
                const storageRef = ref(storage, fileName);
                await deleteObject(storageRef);
            } catch (storageError) {
                console.warn('Error deleting attachment:', storageError);
                // Continue even if storage deletion fails
            }
        }

        // Soft delete - set isActive to false
        await updateDoc(announcementRef, {
            isActive: false,
            deletedAt: Timestamp.now()
        });

        return true;
    } catch (error) {
        console.error('Error deleting announcement:', error);
        throw new Error('Gagal menghapus pengumuman');
    }
};

/**
 * Hard delete announcement (permanent)
 */
export const hardDeleteAnnouncement = async (announcementId) => {
    try {
        const announcementRef = doc(db, 'announcements', announcementId);
        await deleteDoc(announcementRef);
        return true;
    } catch (error) {
        console.error('Error hard deleting announcement:', error);
        throw error;
    }
};

/**
 * Get announcement by ID
 */
export const getAnnouncementById = async (announcementId) => {
    try {
        const announcementRef = doc(db, 'announcements', announcementId);
        const snapshot = await getDoc(announcementRef);

        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting announcement:', error);
        throw error;
    }
};
