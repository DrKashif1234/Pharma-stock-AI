export type DosageForm = 
  | 'Tablet' 
  | 'Capsule' 
  | 'Syrup' 
  | 'Injection' 
  | 'Inhaler' 
  | 'Ointment' 
  | 'Drops' 
  | 'Suspension' 
  | 'Cream' 
  | 'Vial';

export type MedicineCategory = 
  | 'Antibiotics' 
  | 'Cardiovascular' 
  | 'Analgesics' 
  | 'Antidiabetic' 
  | 'Respiratory' 
  | 'Gastrointestinal' 
  | 'Antihistamines' 
  | 'Vitamins & Supplements' 
  | 'Dermatological' 
  | 'Emergency Medicine';

export type ExpiryStatus = 'EXPIRED' | 'NEAR_30_DAYS' | 'NEAR_60_DAYS' | 'NEAR_90_DAYS' | 'HEALTHY';
export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'OPTIMAL' | 'OVERSTOCKED';

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  brand: string;
  category: MedicineCategory | string;
  dosage_form: DosageForm | string;
  strength: string;
  batch_number: string;
  supplier: string;
  quantity: number;
  min_stock_level: number;
  purchase_price: number;
  selling_price: number;
  manufacturing_date: string;
  expiry_date: string;
  storage_location: string;
  qr_code: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export type TransactionReason = 
  // Stock In reasons
  | 'Purchase' 
  | 'Return' 
  | 'Donation' 
  | 'Manual Adjustment'
  // Stock Out reasons
  | 'Dispensing' 
  | 'Sale' 
  | 'Damage' 
  | 'Expired' 
  | 'Disposal';

export interface InventoryTransaction {
  id: string;
  medicine_id: string;
  medicine_name: string;
  batch_number?: string;
  transaction_type: TransactionType;
  reason: TransactionReason | string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  timestamp: string;
  notes?: string;
  operator?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  medicines_supplied?: string[];
  status: 'ACTIVE' | 'INACTIVE';
  rating?: number;
  lead_time_days?: number;
  notes?: string;
  created_at?: string;
}

export type ReportType = 
  | 'INVENTORY' 
  | 'EXPIRY' 
  | 'LOW_STOCK' 
  | 'MOVEMENT' 
  | 'SUPPLIER' 
  | 'VALUATION' 
  | 'AI_OPTIMIZATION';

export interface Report {
  id: string;
  title: string;
  report_type: ReportType;
  generated_by: string;
  file_format: 'PDF' | 'EXCEL' | 'CSV';
  record_count: number;
  summary: string;
  created_at: string;
  url?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    lowStockItems?: Medicine[];
    expiredItems?: Medicine[];
    recommendationType?: 'REORDER' | 'DISPOSAL' | 'AUDIT' | 'OPTIMIZATION' | 'GENERAL';
    suggestedActions?: {
      label: string;
      action: string;
      medicineId?: string;
    }[];
  };
}

export interface CategoryDistribution {
  category: string;
  count: number;
  totalValue: number;
  quantity: number;
}

export interface MonthlyMovement {
  month: string;
  stockIn: number;
  stockOut: number;
  netChange: number;
}

export interface ExpiryTimelineItem {
  period: string;
  count: number;
  value: number;
  medicines: { id: string; name: string; batch_number: string; expiry_date: string; quantity: number }[];
}

export interface DashboardMetrics {
  totalMedicines: number;
  totalStockQuantity: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  nearExpiryCount: number;
  expiredCount: number;
  categoryBreakdown: CategoryDistribution[];
  monthlyMovement: MonthlyMovement[];
  expiryTimeline: ExpiryTimelineItem[];
  recentTransactions: InventoryTransaction[];
}

export interface FilterOptions {
  search: string;
  category: string;
  status: string; // all, low_stock, out_of_stock, expired, near_expiry
  supplier: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
