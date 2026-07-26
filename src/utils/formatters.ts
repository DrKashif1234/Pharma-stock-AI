/**
 * Currency and numerical formatting utilities for pharmacy data
 */

export function formatCurrency(amount: number | string | undefined): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '$0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(num: number | string | undefined): string {
  if (num === undefined || num === null || isNaN(Number(num))) {
    return '0';
  }
  const val = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('en-US').format(val);
}

export function generateQRString(medicine: { id?: string; name: string; batch_number: string; expiry_date: string }): string {
  const payload = {
    app: 'PharmaStockAI',
    id: medicine.id || 'new',
    name: medicine.name,
    batch: medicine.batch_number,
    exp: medicine.expiry_date
  };
  return JSON.stringify(payload);
}

export function parseQRString(qrString: string): { id?: string; name?: string; batch?: string; exp?: string } | null {
  try {
    const data = JSON.parse(qrString);
    if (data && (data.app === 'PharmaStockAI' || data.id || data.name || data.batch)) {
      return data;
    }
    return null;
  } catch {
    // Attempt plain text match if not JSON
    if (qrString && qrString.length > 2) {
      return { name: qrString, batch: 'QR-SCANNED' };
    }
    return null;
  }
}

export function generateBatchNumber(category: string): string {
  const prefix = category ? category.substring(0, 3).toUpperCase() : 'BAT';
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}-${random}`;
}
