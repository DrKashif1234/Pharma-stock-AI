-- =====================================================================
-- PharmaStock AI: Normalized PostgreSQL Database Schema for Supabase
-- Designed for High Scalability, Integrity, and Audit Compliance
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL,
    strength VARCHAR(50) NOT NULL,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_stock_level INTEGER NOT NULL DEFAULT 20 CHECK (min_stock_level >= 0),
    purchase_price NUMERIC(10, 2) NOT NULL CHECK (purchase_price >= 0),
    selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    storage_location VARCHAR(255) NOT NULL,
    qr_code TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Medicines table for fast searching and expiry monitoring
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON medicines(generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry_date ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_medicines_quantity ON medicines(quantity);
CREATE INDEX IF NOT EXISTS idx_medicines_batch_number ON medicines(batch_number);

-- 3. Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT')),
    reason VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    operator VARCHAR(100) DEFAULT 'Pharmacist on Duty',
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_medicine_id ON inventory_transactions(medicine_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON inventory_transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON inventory_transactions(transaction_type);

-- 4. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('INVENTORY', 'EXPIRY', 'LOW_STOCK', 'MOVEMENT', 'SUPPLIER', 'VALUATION', 'AI_OPTIMIZATION')),
    generated_by VARCHAR(100) NOT NULL,
    file_format VARCHAR(10) NOT NULL CHECK (file_format IN ('PDF', 'EXCEL', 'CSV')),
    record_count INTEGER NOT NULL DEFAULT 0,
    summary TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- 5. AI Chat History Table
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_query TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_created_at ON ai_chat_history(created_at DESC);

-- Automatically update updated_at timestamp on record modification
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_medicines_modtime
    BEFORE UPDATE ON medicines
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_suppliers_modtime
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
