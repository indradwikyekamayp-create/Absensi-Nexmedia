// Date Utility Functions
import { format, parseISO, differenceInMinutes, startOfDay, endOfDay, subMonths, setDate, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { CUTOFF } from './constants';

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateKey = (date) => {
    return format(date, 'yyyy-MM-dd');
};

/**
 * Format date for display (Indonesian)
 */
export const formatDateDisplay = (date) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'd MMMM yyyy', { locale: id });
};

/**
 * Format time for display
 */
export const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
};

/**
 * Format duration in minutes to hours and minutes string
 */
export const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '0 menit';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins} menit`;
    if (mins === 0) return `${hours} jam`;
    return `${hours} jam ${mins} menit`;
};

/**
 * Format deficit duration (with negative sign)
 */
export const formatDeficit = (minutes) => {
    if (!minutes || minutes <= 0) return '-';
    return `-${formatDuration(minutes)}`;
};

/**
 * Calculate work duration in minutes between two timestamps
 */
export const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;

    const start = checkIn.toDate ? checkIn.toDate() : new Date(checkIn);
    const end = checkOut.toDate ? checkOut.toDate() : new Date(checkOut);

    return differenceInMinutes(end, start);
};

/**
 * Get cutoff period for a given reference date
 * Returns start and end dates
 */
export const getCutoffPeriod = (referenceDate = new Date()) => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    // Start: 21st of previous month
    let startDate = setDate(subMonths(referenceDate, 1), CUTOFF.START_DAY);
    startDate = startOfDay(startDate);

    // End: 20th of current month
    let endDate = setDate(referenceDate, CUTOFF.END_DAY);
    endDate = endOfDay(endDate);

    return { startDate, endDate };
};

/**
 * Check if a date is within cutoff period
 */
export const isWithinCutoff = (date, referenceDate = new Date()) => {
    const { startDate, endDate } = getCutoffPeriod(referenceDate);
    const checkDate = typeof date === 'string' ? parseISO(date) : date;

    return isWithinInterval(checkDate, { start: startDate, end: endDate });
};

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayKey = () => {
    return formatDateKey(new Date());
};

/**
 * Format cutoff period label
 */
export const formatCutoffLabel = (referenceDate = new Date()) => {
    const { startDate, endDate } = getCutoffPeriod(referenceDate);
    return `${format(startDate, 'd MMM', { locale: id })} - ${format(endDate, 'd MMM yyyy', { locale: id })}`;
};

/**
 * Get elapsed time since check-in (for live timer)
 */
export const getElapsedMinutes = (checkInTimestamp) => {
    if (!checkInTimestamp) return 0;

    const start = checkInTimestamp.toDate ? checkInTimestamp.toDate() : new Date(checkInTimestamp);
    return differenceInMinutes(new Date(), start);
};

/**
 * Format live timer display
 */
export const formatLiveTimer = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = 0; // We only update per minute for performance

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
