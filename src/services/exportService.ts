import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Medicine, InventoryTransaction, ReportType, ExpiryStatus } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { getExpiryStatus, formatDate } from '../utils/dateUtils';

export const exportService = {
  /**
   * Export Medicines to PDF
   */
  exportMedicinesToPDF(medicines: Medicine[], title: string = 'Pharmacy Inventory Report') {
    const doc = new jsPDF('landscape');
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('PharmaStock AI — Clinical Inventory Audit', 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`${title} | Generated: ${new Date().toLocaleString()}`, 14, 22);
    
    // Table
    const tableData = medicines.map(m => {
      const status = getExpiryStatus(m.expiry_date);
      let statusStr = 'Healthy';
      if (status === 'EXPIRED') statusStr = 'EXPIRED';
      else if (status === 'NEAR_30_DAYS') statusStr = '< 30 Days';
      else if (status === 'NEAR_60_DAYS') statusStr = '< 60 Days';
      else if (status === 'NEAR_90_DAYS') statusStr = '< 90 Days';

      return [
        m.name,
        m.generic_name,
        m.category,
        m.batch_number,
        formatNumber(m.quantity),
        formatCurrency(m.purchase_price),
        formatCurrency(m.selling_price),
        formatDate(m.expiry_date),
        statusStr,
        m.storage_location
      ];
    });

    autoTable(doc, {
      startY: 28,
      head: [['Medicine Name', 'Generic Name', 'Category', 'Batch #', 'Qty', 'Cost', 'Price', 'Expiry Date', 'Status', 'Location']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [14, 116, 144], textColor: 255, fontStyle: 'bold' }, // cyan-700 healthcare theme
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 2.5 },
      didParseCell: function (data) {
        if (data.column.index === 8 && data.cell.section === 'body') {
          const val = data.cell.raw;
          if (val === 'EXPIRED') {
            data.cell.styles.textColor = [220, 38, 38]; // red
            data.cell.styles.fontStyle = 'bold';
          } else if (val === '< 30 Days' || val === '< 60 Days') {
            data.cell.styles.textColor = [217, 119, 6]; // amber
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  },

  /**
   * Export Medicines to Excel (.xlsx)
   */
  exportMedicinesToExcel(medicines: Medicine[], title: string = 'Pharmacy_Inventory') {
    const formattedData = medicines.map(m => ({
      'Medicine ID': m.id,
      'Brand Name': m.name,
      'Generic Name': m.generic_name,
      'Category': m.category,
      'Dosage Form': m.dosage_form,
      'Strength': m.strength,
      'Batch Number': m.batch_number,
      'Supplier': m.supplier,
      'Current Stock': m.quantity,
      'Min Stock Level': m.min_stock_level,
      'Purchase Price ($)': m.purchase_price,
      'Selling Price ($)': m.selling_price,
      'Total Inventory Value ($)': (m.quantity * m.purchase_price).toFixed(2),
      'Manufacturing Date': m.manufacturing_date,
      'Expiry Date': m.expiry_date,
      'Expiry Status': getExpiryStatus(m.expiry_date),
      'Storage Location': m.storage_location,
      'Notes': m.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory_Audit');

    // Auto-width columns
    const maxCols = Object.keys(formattedData[0] || {}).length;
    worksheet['!cols'] = Array(maxCols).fill({ wch: 20 });

    XLSX.writeFile(workbook, `${title}_${Date.now()}.xlsx`);
  },

  /**
   * Export Medicines to CSV
   */
  exportMedicinesToCSV(medicines: Medicine[], title: string = 'Pharmacy_Inventory') {
    const formattedData = medicines.map(m => ({
      ID: m.id,
      Name: m.name,
      GenericName: m.generic_name,
      Category: m.category,
      DosageForm: m.dosage_form,
      Strength: m.strength,
      BatchNumber: m.batch_number,
      Supplier: m.supplier,
      Quantity: m.quantity,
      MinStockLevel: m.min_stock_level,
      PurchasePrice: m.purchase_price,
      SellingPrice: m.selling_price,
      ExpiryDate: m.expiry_date,
      StorageLocation: m.storage_location
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export Transactions to PDF
   */
  exportTransactionsToPDF(transactions: InventoryTransaction[], title: string = 'Stock Movement Report') {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('PharmaStock AI — Stock Movement & Audit Log', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${title} | Generated: ${new Date().toLocaleString()}`, 14, 22);

    const tableData = transactions.map(t => [
      formatDate(t.timestamp),
      t.medicine_name,
      t.batch_number || 'N/A',
      t.transaction_type,
      t.reason,
      formatNumber(t.quantity),
      `${t.previous_quantity} → ${t.new_quantity}`,
      t.operator || 'Admin'
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['Date', 'Medicine', 'Batch #', 'Type', 'Reason', 'Qty', 'Stock Shift', 'Operator']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // emerald healthcare theme
      styles: { fontSize: 8 }
    });

    doc.save(`stock_movement_${Date.now()}.pdf`);
  },

  /**
   * Export Transactions to Excel (.xlsx)
   */
  exportTransactionsToExcel(transactions: InventoryTransaction[], title: string = 'Stock_Movement_Report') {
    const formattedData = transactions.map(t => ({
      'Transaction ID': t.id,
      'Timestamp': formatDate(t.timestamp),
      'Medicine ID': t.medicine_id,
      'Medicine Name': t.medicine_name,
      'Batch Number': t.batch_number || 'N/A',
      'Transaction Type': t.transaction_type,
      'Reason': t.reason,
      'Quantity Shift': t.quantity,
      'Previous Stock': t.previous_quantity,
      'New Stock': t.new_quantity,
      'Operator': t.operator || 'Pharmacist',
      'Notes': t.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock_Transactions');
    XLSX.writeFile(workbook, `${title}_${Date.now()}.xlsx`);
  },

  /**
   * Export Transactions to CSV
   */
  exportTransactionsToCSV(transactions: InventoryTransaction[], title: string = 'Stock_Movement_Report') {
    const formattedData = transactions.map(t => ({
      ID: t.id,
      Date: formatDate(t.timestamp),
      MedicineName: t.medicine_name,
      BatchNumber: t.batch_number || 'N/A',
      Type: t.transaction_type,
      Reason: t.reason,
      Quantity: t.quantity,
      PreviousStock: t.previous_quantity,
      NewStock: t.new_quantity,
      Operator: t.operator || 'Pharmacist'
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
