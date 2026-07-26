import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_MEDICINES, DEFAULT_TRANSACTIONS, DEFAULT_SUPPLIERS, DEFAULT_CHAT_HISTORY, DEFAULT_REPORTS } from './defaultData';
import { Medicine, InventoryTransaction, Supplier, Report, AIChatMessage, DashboardMetrics } from '../src/types';

// In-memory persistent database store for preview environment
let medicines: Medicine[] = [...DEFAULT_MEDICINES];
let transactions: InventoryTransaction[] = [...DEFAULT_TRANSACTIONS];
let suppliers: Supplier[] = [...DEFAULT_SUPPLIERS];
let reports: Report[] = [...DEFAULT_REPORTS];
let chatHistory: AIChatMessage[] = [...DEFAULT_CHAT_HISTORY];

export const apiRouter = express.Router();

// Helper to compute live dashboard metrics
function computeMetrics(): DashboardMetrics {
  const totalMedicines = medicines.length;
  const totalStockQuantity = medicines.reduce((sum, m) => sum + m.quantity, 0);
  const inventoryValue = medicines.reduce((sum, m) => sum + (m.quantity * m.purchase_price), 0);
  
  const lowStockCount = medicines.filter(m => m.quantity > 0 && m.quantity <= (m.min_stock_level || 20)).length;
  const outOfStockCount = medicines.filter(m => m.quantity <= 0).length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let expiredCount = 0;
  let nearExpiryCount = 0; // within 90 days
  
  medicines.forEach(m => {
    if (!m.expiry_date) return;
    const exp = new Date(m.expiry_date);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) {
      expiredCount++;
    } else if (diffDays <= 90) {
      nearExpiryCount++;
    }
  });

  // Category breakdown
  const categoryMap = new Map<string, { count: number; totalValue: number; quantity: number }>();
  medicines.forEach(m => {
    const cat = m.category || 'Uncategorized';
    const curr = categoryMap.get(cat) || { count: 0, totalValue: 0, quantity: 0 };
    curr.count += 1;
    curr.quantity += m.quantity;
    curr.totalValue += m.quantity * m.purchase_price;
    categoryMap.set(cat, curr);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([cat, val]) => ({
    category: cat,
    count: val.count,
    totalValue: val.totalValue,
    quantity: val.quantity
  }));

  // Monthly movement simulation
  const monthlyMovement = [
    { month: 'Feb', stockIn: 1200, stockOut: 980, netChange: 220 },
    { month: 'Mar', stockIn: 1540, stockOut: 1320, netChange: 220 },
    { month: 'Apr', stockIn: 1100, stockOut: 1450, netChange: -350 },
    { month: 'May', stockIn: 1890, stockOut: 1600, netChange: 290 },
    { month: 'Jun', stockIn: 2100, stockOut: 1750, netChange: 350 },
    { month: 'Jul', stockIn: 1650, stockOut: 1400, netChange: 250 },
  ];

  // Expiry timeline
  const expiryTimeline = [
    {
      period: 'Expired (Immediate Action)',
      count: expiredCount,
      value: medicines.filter(m => new Date(m.expiry_date) < today).reduce((s, m) => s + m.quantity * m.purchase_price, 0),
      medicines: medicines.filter(m => new Date(m.expiry_date) < today).map(m => ({ id: m.id, name: m.name, batch_number: m.batch_number, expiry_date: m.expiry_date, quantity: m.quantity }))
    },
    {
      period: 'Within 30 Days (< 1 Month)',
      count: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d >= 0 && d <= 30;
      }).length,
      value: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d >= 0 && d <= 30;
      }).reduce((s, m) => s + m.quantity * m.purchase_price, 0),
      medicines: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d >= 0 && d <= 30;
      }).map(m => ({ id: m.id, name: m.name, batch_number: m.batch_number, expiry_date: m.expiry_date, quantity: m.quantity }))
    },
    {
      period: '31 - 60 Days (1-2 Months)',
      count: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 30 && d <= 60;
      }).length,
      value: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 30 && d <= 60;
      }).reduce((s, m) => s + m.quantity * m.purchase_price, 0),
      medicines: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 30 && d <= 60;
      }).map(m => ({ id: m.id, name: m.name, batch_number: m.batch_number, expiry_date: m.expiry_date, quantity: m.quantity }))
    },
    {
      period: '61 - 90 Days (2-3 Months)',
      count: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 60 && d <= 90;
      }).length,
      value: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 60 && d <= 90;
      }).reduce((s, m) => s + m.quantity * m.purchase_price, 0),
      medicines: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 60 && d <= 90;
      }).map(m => ({ id: m.id, name: m.name, batch_number: m.batch_number, expiry_date: m.expiry_date, quantity: m.quantity }))
    },
    {
      period: '> 90 Days (Healthy Stock)',
      count: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 90;
      }).length,
      value: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 90;
      }).reduce((s, m) => s + m.quantity * m.purchase_price, 0),
      medicines: medicines.filter(m => {
        const d = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / (86400000));
        return d > 90;
      }).map(m => ({ id: m.id, name: m.name, batch_number: m.batch_number, expiry_date: m.expiry_date, quantity: m.quantity }))
    }
  ];

  return {
    totalMedicines,
    totalStockQuantity,
    inventoryValue,
    lowStockCount,
    outOfStockCount,
    nearExpiryCount,
    expiredCount,
    categoryBreakdown,
    monthlyMovement,
    expiryTimeline,
    recentTransactions: transactions.slice(0, 10)
  };
}

// GET /api/analytics
apiRouter.get('/analytics', (req: Request, res: Response) => {
  res.json({ success: true, data: computeMetrics() });
});

// GET /api/medicines
apiRouter.get('/medicines', (req: Request, res: Response) => {
  res.json({ success: true, data: medicines });
});

// POST /api/medicines
apiRouter.post('/medicines', (req: Request, res: Response) => {
  try {
    const newMed: Medicine = {
      ...req.body,
      id: req.body.id || `med-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (!newMed.qr_code) {
      newMed.qr_code = JSON.stringify({ app: 'PharmaStockAI', id: newMed.id, name: newMed.name, batch: newMed.batch_number });
    }
    medicines.unshift(newMed);
    
    // Create initial stock in transaction if quantity > 0
    if (newMed.quantity > 0) {
      transactions.unshift({
        id: `tx-${Date.now()}`,
        medicine_id: newMed.id,
        medicine_name: newMed.name,
        batch_number: newMed.batch_number,
        transaction_type: 'STOCK_IN',
        reason: 'Purchase',
        quantity: newMed.quantity,
        previous_quantity: 0,
        new_quantity: newMed.quantity,
        timestamp: new Date().toISOString(),
        notes: `Initial stock registration for ${newMed.name}`,
        operator: 'System Admin'
      });
    }
    
    res.status(201).json({ success: true, data: newMed });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to add medicine' });
  }
});

// PUT /api/medicines/:id
apiRouter.put('/medicines/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = medicines.findIndex(m => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Medicine not found' });
  }
  
  const prevQty = medicines[idx].quantity;
  const updatedMed: Medicine = {
    ...medicines[idx],
    ...req.body,
    id,
    updated_at: new Date().toISOString()
  };
  
  medicines[idx] = updatedMed;

  // If quantity was explicitly changed in edit
  if (updatedMed.quantity !== prevQty) {
    const diff = updatedMed.quantity - prevQty;
    transactions.unshift({
      id: `tx-${Date.now()}`,
      medicine_id: updatedMed.id,
      medicine_name: updatedMed.name,
      batch_number: updatedMed.batch_number,
      transaction_type: diff > 0 ? 'STOCK_IN' : 'STOCK_OUT',
      reason: 'Manual Adjustment',
      quantity: Math.abs(diff),
      previous_quantity: prevQty,
      new_quantity: updatedMed.quantity,
      timestamp: new Date().toISOString(),
      notes: `Manual stock edit from ${prevQty} to ${updatedMed.quantity}`,
      operator: 'System Admin'
    });
  }

  res.json({ success: true, data: updatedMed });
});

// DELETE /api/medicines/:id
apiRouter.delete('/medicines/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = medicines.findIndex(m => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Medicine not found' });
  }
  const removed = medicines.splice(idx, 1)[0];
  res.json({ success: true, data: removed });
});

// GET /api/transactions
apiRouter.get('/transactions', (req: Request, res: Response) => {
  res.json({ success: true, data: transactions });
});

// POST /api/transactions (Stock In / Stock Out / Adjustment)
apiRouter.post('/transactions', (req: Request, res: Response) => {
  try {
    const { medicine_id, transaction_type, reason, quantity, notes, operator } = req.body;
    const medIdx = medicines.findIndex(m => m.id === medicine_id);
    if (medIdx === -1) {
      return res.status(404).json({ success: false, error: 'Target medicine not found in inventory' });
    }

    const med = medicines[medIdx];
    const prevQty = med.quantity;
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be a positive number' });
    }

    let newQty = prevQty;
    if (transaction_type === 'STOCK_IN') {
      newQty = prevQty + qtyNum;
    } else if (transaction_type === 'STOCK_OUT') {
      if (prevQty < qtyNum && reason !== 'Expired' && reason !== 'Disposal') {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for dispensing. Available quantity: ${prevQty} units.` 
        });
      }
      newQty = Math.max(0, prevQty - qtyNum);
    } else if (transaction_type === 'ADJUSTMENT') {
      newQty = qtyNum;
    }

    // Update medicine quantity
    medicines[medIdx].quantity = newQty;
    medicines[medIdx].updated_at = new Date().toISOString();

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      medicine_id: med.id,
      medicine_name: med.name,
      batch_number: med.batch_number,
      transaction_type,
      reason: reason || (transaction_type === 'STOCK_IN' ? 'Purchase' : 'Dispensing'),
      quantity: transaction_type === 'ADJUSTMENT' ? Math.abs(newQty - prevQty) : qtyNum,
      previous_quantity: prevQty,
      new_quantity: newQty,
      timestamp: new Date().toISOString(),
      notes: notes || `${transaction_type} operation (${reason})`,
      operator: operator || 'Pharmacist on Duty'
    };

    transactions.unshift(newTx);
    res.status(201).json({ success: true, data: newTx, updatedMedicine: medicines[medIdx] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Transaction processing failed' });
  }
});

// GET /api/suppliers
apiRouter.get('/suppliers', (req: Request, res: Response) => {
  res.json({ success: true, data: suppliers });
});

// POST /api/suppliers
apiRouter.post('/suppliers', (req: Request, res: Response) => {
  try {
    const newSup: Supplier = {
      ...req.body,
      id: req.body.id || `sup-${Date.now()}`,
      status: req.body.status || 'ACTIVE',
      created_at: new Date().toISOString()
    };
    suppliers.unshift(newSup);
    res.status(201).json({ success: true, data: newSup });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to add supplier' });
  }
});

// GET /api/reports
apiRouter.get('/reports', (req: Request, res: Response) => {
  res.json({ success: true, data: reports });
});

// POST /api/reports
apiRouter.post('/reports', (req: Request, res: Response) => {
  try {
    const newRep: Report = {
      id: `rep-${Date.now()}`,
      title: req.body.title || `Inventory Audit Report - ${new Date().toLocaleDateString()}`,
      report_type: req.body.report_type || 'INVENTORY',
      generated_by: req.body.generated_by || 'PharmaStock AI Engine',
      file_format: req.body.file_format || 'PDF',
      record_count: req.body.record_count || medicines.length,
      summary: req.body.summary || `Comprehensive analytics report covering ${medicines.length} inventory records.`,
      created_at: new Date().toISOString()
    };
    reports.unshift(newRep);
    res.status(201).json({ success: true, data: newRep });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create report record' });
  }
});

// GET /api/ai/history
apiRouter.get('/ai/history', (req: Request, res: Response) => {
  res.json({ success: true, data: chatHistory });
});

// POST /api/ai/chat - GEMINI API INTEGRATION ROUTE
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Query parameter is required' });
    }

    // Save user message to chat history
    const userMsg: AIChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    chatHistory.push(userMsg);

    // Prepare relevant inventory context (as mandated by PRD: "Only provide Gemini with information required to answer... Never expose unnecessary database records")
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredList = medicines.filter(m => new Date(m.expiry_date) < today);
    const nearExpiryList = medicines.filter(m => {
      const diff = Math.floor((new Date(m.expiry_date).getTime() - today.getTime()) / 86400000);
      return diff >= 0 && diff <= 90;
    });
    const lowStockList = medicines.filter(m => m.quantity <= (m.min_stock_level || 20));
    const outOfStockList = medicines.filter(m => m.quantity <= 0);

    // Filter relevant medicines if query mentions specific keywords or categories
    const lowerQ = query.toLowerCase();
    const relevantMedicines = medicines.filter(m => 
      lowerQ.includes(m.name.toLowerCase()) || 
      lowerQ.includes(m.generic_name.toLowerCase()) || 
      lowerQ.includes((m.category || '').toLowerCase()) ||
      lowerQ.includes('all') || lowerQ.includes('stock') || lowerQ.includes('expire') || lowerQ.includes('report') || lowerQ.includes('reorder')
    ).slice(0, 15); // limit to avoid token bloat

    const inventoryContext = JSON.stringify({
      summaryStats: {
        totalMedicines: medicines.length,
        totalStockQuantity: medicines.reduce((s, m) => s + m.quantity, 0),
        totalValuation: `$${medicines.reduce((s, m) => s + m.quantity * m.purchase_price, 0).toFixed(2)}`,
        expiredCount: expiredList.length,
        nearExpiry90DaysCount: nearExpiryList.length,
        lowStockCount: lowStockList.length,
        outOfStockCount: outOfStockList.length
      },
      expiredMedicines: expiredList.map(m => ({ id: m.id, name: m.name, batch: m.batch_number, expiry_date: m.expiry_date, quantity: m.quantity, location: m.storage_location })),
      lowStockMedicines: lowStockList.map(m => ({ id: m.id, name: m.name, batch: m.batch_number, quantity: m.quantity, min_level: m.min_stock_level, supplier: m.supplier })),
      outOfStockMedicines: outOfStockList.map(m => ({ id: m.id, name: m.name, supplier: m.supplier })),
      sampleRelevantInventory: relevantMedicines.map(m => ({
        id: m.id, name: m.name, generic: m.generic_name, category: m.category, qty: m.quantity, min_qty: m.min_stock_level, price: m.selling_price, exp: m.expiry_date, batch: m.batch_number
      }))
    }, null, 2);

    const systemPrompt = `You are PharmaStock AI.
You are an expert pharmacy inventory management assistant.
Your job is helping pharmacists safely manage medicine inventory.
Only answer using supplied inventory information.
Never invent medicines.
Never estimate stock.
Never fabricate expiry dates.
Never guess quantities.
Always prioritize patient safety.
Always warn about expired medicines.
Recommend medicines that should be reordered.
Recommend inventory optimization.
Use concise professional pharmacy language.
If information is unavailable, clearly state that it is unavailable.

LIVE INVENTORY DATA CONTEXT:
${inventoryContext}`;

    let aiResponseText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: query,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3
          }
        });

        aiResponseText = response.text || 'No response generated from AI engine.';
      } catch (geminiError: any) {
        console.error('Gemini API Error:', geminiError);
        aiResponseText = `[AI Analysis Fallback Engine] Based on live inventory verification:
- **Expired Alerts**: We have **${expiredList.length} expired medicine(s)** (${expiredList.map(m => `${m.name} [Batch ${m.batch_number}]`).join(', ')}). Immediate quarantine and disposal required for patient safety.
- **Stock replenishment**: There are **${outOfStockList.length} out-of-stock items** (${outOfStockList.map(m => m.name).join(', ')}) and **${lowStockList.length} low-stock items** requiring urgent reordering from authorized suppliers.
- **Expiry Monitoring**: **${nearExpiryList.length} items** expire within the next 90 days. Recommend prioritizing stock rotation (FIFO / FEFO).`;
      }
    } else {
      // Intelligent Rule-Based Fallback if GEMINI_API_KEY is not set in preview
      aiResponseText = `### PharmaStock AI Clinical & Inventory Assessment
*(Note: Operating in local intelligence mode. Connect Gemini API Key in Settings for neural synthesis)*

**1. Patient Safety & Expiry Verification:**
${expiredList.length > 0 
  ? `⚠️ **CRITICAL WARNING**: We have identified **${expiredList.length} expired product(s)** in active inventory:\n` + expiredList.map(e => `* **${e.name}** (Batch ${e.batch_number}) — Expired on ${e.expiry_date}. **Action**: Remove from ${e.storage_location} immediately for regulated disposal.`).join('\n')
  : `✅ No expired medications detected in active storage.`}

**2. Replenishment & Low Stock Recommendations:**
${outOfStockList.length > 0 
  ? `🔴 **Out of Stock**: **${outOfStockList.map(o => o.name).join(', ')}**. Recommend immediate purchase order initiation.` 
  : ''}
${lowStockList.length > 0 
  ? `🟡 **Low Stock Threshold Reached**: Identified **${lowStockList.length} item(s)** below safety stock levels:\n` + lowStockList.map(l => `* **${l.name}** — Current Stock: ${l.quantity} units (Minimum required: ${l.min_stock_level} units). Supplier: ${l.supplier}.`).join('\n')
  : `✅ All monitored inventory lines are operating above minimum safety stock thresholds.`}

**3. Strategic Inventory Optimization:**
We recommend adhering strictly to **FEFO (First-Expired, First-Out)** dispensing protocols for the **${nearExpiryList.length} item(s)** expiring within 90 days. Regular audits ensure regulatory compliance and minimize financial write-offs.`;
    }

    // Determine metadata recommendations to attach for quick UI buttons
    const suggestedActions: { label: string; action: string; medicineId?: string }[] = [];
    if (expiredList.length > 0) {
      suggestedActions.push({ label: 'Quarantine Expired Batch', action: 'FILTER_EXPIRED' });
    }
    if (outOfStockList.length > 0 || lowStockList.length > 0) {
      suggestedActions.push({ label: 'Create Purchase Requisition', action: 'VIEW_REORDER' });
    }
    suggestedActions.push({ label: 'Generate Full Audit Report', action: 'VIEW_REPORTS' });

    const assistantMsg: AIChatMessage = {
      id: `msg-a-${Date.now()}`,
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date().toISOString(),
      metadata: {
        lowStockItems: lowStockList,
        expiredItems: expiredList,
        recommendationType: expiredList.length > 0 ? 'DISPOSAL' : (lowStockList.length > 0 ? 'REORDER' : 'GENERAL'),
        suggestedActions
      }
    };

    chatHistory.push(assistantMsg);

    res.json({ success: true, data: assistantMsg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'AI request failed' });
  }
});

// POST /api/qr/scan - lookup medicine by QR code or batch
apiRouter.post('/qr/scan', (req: Request, res: Response) => {
  try {
    const { qrData } = req.body;
    if (!qrData) {
      return res.status(400).json({ success: false, error: 'QR data is required' });
    }

    let searchId = '';
    let searchBatch = '';
    let searchName = '';

    try {
      const parsed = JSON.parse(qrData);
      searchId = parsed.id || '';
      searchBatch = parsed.batch || '';
      searchName = parsed.name || '';
    } catch {
      searchBatch = qrData.trim();
      searchName = qrData.trim();
    }

    const found = medicines.find(m => 
      (searchId && m.id === searchId) ||
      (searchBatch && m.batch_number.toLowerCase() === searchBatch.toLowerCase()) ||
      (searchName && m.name.toLowerCase().includes(searchName.toLowerCase())) ||
      m.qr_code === qrData
    );

    if (!found) {
      return res.status(404).json({ success: false, error: `No medicine found matching scan: "${qrData}"` });
    }

    res.json({ success: true, data: found });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'QR Scan processing error' });
  }
});
