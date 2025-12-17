// Firebase Cloud Functions for User Management
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Create User Function (Admin only)
exports.createUser = functions.region('asia-southeast2').https.onCall(async (data, context) => {
    // Check if requester is admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('user').doc(callerUid).get();

    if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can create users');
    }

    const { email, password, name, position, role, workHoursTarget } = data;

    if (!email || !password || !name || !position) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
        // Create Firebase Auth user
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        // Create Firestore user document
        await admin.firestore().collection('user').doc(userRecord.uid).set({
            email,
            name,
            position,
            role: role || 'employee',
            workHoursTarget: workHoursTarget || 8,
            photoURL: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            createdBy: callerUid
        });

        return { success: true, uid: userRecord.uid };
    } catch (error) {
        console.error('Error creating user:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
