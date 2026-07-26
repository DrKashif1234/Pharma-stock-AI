import { format, differenceInDays, isBefore, isAfter, parseISO, addDays, subMonths } from 'date-fns';
import { Medicine, ExpiryStatus, StockStatus } from '../types';

/**
 * Calculates the exact expiry status of a medicine
 */
export function getExpiryStatus(expiryDateStr: string): ExpiryStatus {
  if (!expiryDateStr) return 'HEALTHY';
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);

    if (isBefore(expiryDate, today)) {
      return 'EXPIRED';
    }

    const daysUntilExpiry = differenceInDays(expiryDate, today);

    if (daysUntilExpiry <= 30) {
      return 'NEAR_30_DAYS';
    } else if (daysUntilExpiry <= 60) {
      return 'NEAR_60_DAYS';
    } else if (daysUntilExpiry <= 90) {
      return 'NEAR_90_DAYS';
    }

    return 'HEALTHY';
  } catch (err) {
    return 'HEALTHY';
  }
}

/**
 * Calculates days remaining until expiration
 */
export function getDaysUntilExpiry(expiryDateStr: string): number {
  if (!expiryDateStr) return 999;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);
    return differenceInDays(expiryDate, today);
  } catch {
    return 0;
  }
}

/**
 * Calculates stock level status
 */
export function getStockStatus(quantity: number, minStockLevel: number = 20): StockStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= minStockLevel) return 'LOW_STOCK';
  if (quantity > minStockLevel * 5) return 'OVERSTOCKED';
  return 'OPTIMAL';
}

/**
 * Formats a date string nicely (e.g. "26 Jul 2026")
 */
export function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return 'N/A';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return typeof dateStr === 'string' ? dateStr : 'Invalid Date';
    return format(date, 'MMM dd, yyyy');
  } catch {
    return String(dateStr);
  }
}

/**
 * Formats date for HTML input type="date" (YYYY-MM-DD)
 */
export function formatDateForInput(dateStr?: string | Date): string {
  if (!dateStr) return format(new Date(), 'yyyy-MM-dd');
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return format(new Date(), 'yyyy-MM-dd');
    return format(date, 'yyyy-MM-dd');
  } catch {
    return format(new Date(), 'yyyy-MM-dd');
  }
}

/**
 * Generates expiry notification badges and styling info
 */
export function getExpiryBadgeInfo(status: ExpiryStatus) {
  switch (status) {
    case 'EXPIRED':
      return {
        label: 'Expired',
        color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        dot: 'bg-red-600 animate-pulse',
        priority: 1
      };
    case 'NEAR_30_DAYS':
      return {
        label: 'Expires in < 30 days',
        color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        dot: 'bg-orange-500 animate-pulse',
        priority: 2
      };
    case 'NEAR_60_DAYS':
      return {
        label: 'Expires in < 60 days',
        color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        dot: 'bg-amber-500',
        priority: 3
      };
    case 'NEAR_90_DAYS':
      return {
        label: 'Expires in < 90 days',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        dot: 'bg-yellow-500',
        priority: 4
      };
    case 'HEALTHY':
    default:
      return {
        label: 'Healthy Stock',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        priority: 5
      };
  }
}

/**
 * Generates stock status styling
 */
export function getStockBadgeInfo(status: StockStatus) {
  switch (status) {
    case 'OUT_OF_STOCK':
      return {
        label: 'Out of Stock',
        color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400',
        icon: 'AlertOctagon'
      };
    case 'LOW_STOCK':
      return {
        label: 'Low Stock',
        color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
        icon: 'AlertTriangle'
      };
    case 'OVERSTOCKED':
      return {
        label: 'Overstocked',
        color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
        icon: 'TrendingUp'
      };
    case 'OPTIMAL':
    default:
      return {
        label: 'Optimal Level',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: 'CheckCircle2'
      };
  }
}
