# NEX Attendance - Sistem Absensi & Payroll

Aplikasi web fullstack untuk absensi dan payroll dengan fitur real-time monitoring, geofencing, dan manajemen karyawan untuk **NEX Media Indonesia**.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 3.x
- **Maps**: Leaflet.js + OpenStreetMap (Gratis!)
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Icons**: Lucide React

## 📋 Fitur Utama

### Admin Dashboard
- ✅ Real-time monitoring karyawan
- ✅ Live map dengan lokasi karyawan
- ✅ Statistik harian (Hadir, Sakit, Izin, dll)
- ✅ Pulse indicator status kerja

### Absensi
- ✅ Geofencing dengan radius kantor 100m
- ✅ Mode WFH (Work From Home)
- ✅ PK Battle untuk Host/Operator
- ✅ Timer kerja real-time

### Rekapitulasi
- ✅ Filter by nama, jabatan, tanggal
- ✅ Summary card otomatis
- ✅ Export ke CSV
- ✅ Cutoff periode (21 - 20)

### Pengumuman
- ✅ Upload file (PDF/Image)
- ✅ Notifikasi suara real-time
- ✅ Download lampiran

### User Management
- ✅ Create user (via Cloud Functions)
- ✅ Reset password
- ✅ Aktivasi/Nonaktifkan akun
- ✅ Change password (employee)

## 🛠️ Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Create Storage bucket
5. Copy konfigurasi ke `src/services/firebase.js`

### 3. Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

### 4. Setup Initial Admin User

Di Firebase Console > Firestore, buat document:
- Collection: `users`
- Document ID: (copy dari Auth UID setelah create user)
- Fields:
  - email: "admin@nexmedia.id"
  - name: "Administrator"
  - role: "admin"
  - position: "Admin"
  - isActive: true
  - workHoursTarget: 8
  - createdAt: (timestamp)

### 5. Run Development Server

```bash
npm run dev
```

## 📁 Struktur Folder

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Sidebar, Header, Layouts
│   ├── dashboard/       # Dashboard components
│   ├── attendance/      # Attendance components
│   ├── recap/           # Recap components
│   └── announcements/   # Announcement components
├── pages/
│   ├── admin/           # Admin pages
│   └── employee/        # Employee pages
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── services/            # Firebase services
└── utils/               # Utility functions
```

## 🔐 Roles & Permissions

| Action | Admin | Employee |
|--------|-------|----------|
| View Dashboard | ✅ | ❌ |
| View All Attendance | ✅ | Own only |
| Create User | ✅ | ❌ |
| Manual Attendance | ✅ | ❌ |
| Post Announcement | ✅ | ❌ |
| Check-in/out | ❌ | ✅ |
| Change Password | ✅ | ✅ |

## 📍 Lokasi Kantor

- Latitude: -6.1383935
- Longitude: 106.7618308
- Radius: 100 meter

## ⏰ Jam Kerja Target

| Jabatan | Target |
|---------|--------|
| Host | 7 jam |
| Operator | 7 jam |
| Backoffice | 8 jam |
| Digital Marketing | 8 jam |
| OB | 8 jam |

## 📄 License

© 2024 NEX Media Indonesia. All rights reserved.
