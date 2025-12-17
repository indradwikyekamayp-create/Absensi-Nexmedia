// Application Constants

// Office Location for Geofencing
export const OFFICE_LOCATION = {
    lat: -6.1383935,
    lng: 106.7618308,
    radius: 100, // meters
};

// Work Hours Target by Position (in hours)
export const WORK_HOURS_BY_POSITION = {
    'Host': 7,
    'Operator': 7,
    'Backoffice': 8,
    'Digital Marketing': 8,
    'OB': 8,
};

// Available Positions
export const POSITIONS = [
    'Host',
    'Operator',
    'Backoffice',
    'Digital Marketing',
    'OB',
];

// User Roles
export const ROLES = {
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
    WORKING: 'working',
    COMPLETED: 'completed',
    PK_BATTLE: 'pk_battle',
    EARLY_LEAVE: 'early_leave',
    HOLIDAY: 'holiday',
    SICK: 'sick',
    LEAVE: 'leave',
    ABSENT: 'absent',
};

// Status Labels (Indonesian)
export const STATUS_LABELS = {
    working: 'Sedang Kerja',
    completed: 'Selesai',
    pk_battle: 'PK Battle',
    early_leave: 'Pulang Cepat',
    holiday: 'Libur',
    sick: 'Sakit',
    leave: 'Izin',
    absent: 'Tidak Hadir',
};

// Status Colors
export const STATUS_COLORS = {
    working: 'green',
    completed: 'gray',
    pk_battle: 'blue',
    early_leave: 'yellow',
    holiday: 'purple',
    sick: 'orange',
    leave: 'cyan',
    absent: 'red',
};

// Cutoff Period (for salary calculation)
export const CUTOFF = {
    START_DAY: 21,
    END_DAY: 20,
};

// Salary Rules
export const SALARY_RULES = {
    MAX_PAID_SICK_DAYS: 1, // Max sick days that are paid
    MAX_UNPAID_DEDUCTIONS: 3, // Max unpaid days to still get allowance
};

// PK Battle eligible positions
export const PK_BATTLE_POSITIONS = ['Host', 'Operator'];

// Local Storage Keys
export const STORAGE_KEYS = {
    THEME: 'nex-attendance-theme',
    USER: 'nex-attendance-user',
};

// API Error Messages (Indonesian)
export const ERROR_MESSAGES = {
    AUTH_FAILED: 'Email atau password salah',
    NETWORK_ERROR: 'Koneksi internet bermasalah',
    LOCATION_DENIED: 'Izin lokasi ditolak. Aktifkan GPS untuk absen.',
    OUTSIDE_RADIUS: 'Anda berada di luar area kantor',
    ALREADY_CHECKED_IN: 'Anda sudah absen masuk hari ini',
    NOT_CHECKED_IN: 'Anda belum absen masuk',
    GENERIC_ERROR: 'Terjadi kesalahan. Silakan coba lagi.',
};

// Success Messages (Indonesian)
export const SUCCESS_MESSAGES = {
    CHECK_IN: 'Berhasil absen masuk!',
    CHECK_OUT: 'Berhasil absen pulang!',
    USER_CREATED: 'Akun karyawan berhasil dibuat',
    PASSWORD_RESET: 'Link reset password telah dikirim',
    ANNOUNCEMENT_POSTED: 'Pengumuman berhasil diposting',
    DATA_SAVED: 'Data berhasil disimpan',
};
