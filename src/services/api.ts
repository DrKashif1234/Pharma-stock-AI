import { Medicine, InventoryTransaction, Supplier, Report, AIChatMessage, DashboardMetrics } from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error: ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error) errorMsg = errData.error;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Unknown API failure');
  }
  return json.data;
}

export const api = {
  async getAnalytics(): Promise<DashboardMetrics> {
    const res = await fetch(`${BASE_URL}/analytics`);
    return handleResponse<DashboardMetrics>(res);
  },

  async getMedicines(): Promise<Medicine[]> {
    const res = await fetch(`${BASE_URL}/medicines`);
    return handleResponse<Medicine[]>(res);
  },

  async addMedicine(data: Partial<Medicine>): Promise<Medicine> {
    const res = await fetch(`${BASE_URL}/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Medicine>(res);
  },

  async updateMedicine(id: string, data: Partial<Medicine>): Promise<Medicine> {
    const res = await fetch(`${BASE_URL}/medicines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Medicine>(res);
  },

  async deleteMedicine(id: string): Promise<Medicine> {
    const res = await fetch(`${BASE_URL}/medicines/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<Medicine>(res);
  },

  async getTransactions(): Promise<InventoryTransaction[]> {
    const res = await fetch(`${BASE_URL}/transactions`);
    return handleResponse<InventoryTransaction[]>(res);
  },

  async recordTransaction(data: {
    medicine_id: string;
    transaction_type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
    reason: string;
    quantity: number;
    notes?: string;
    operator?: string;
  }): Promise<{ data: InventoryTransaction; updatedMedicine: Medicine }> {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Transaction failed');
    }
    return json;
  },

  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${BASE_URL}/suppliers`);
    return handleResponse<Supplier[]>(res);
  },

  async addSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Supplier>(res);
  },

  async getReports(): Promise<Report[]> {
    const res = await fetch(`${BASE_URL}/reports`);
    return handleResponse<Report[]>(res);
  },

  async createReport(data: Partial<Report>): Promise<Report> {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Report>(res);
  },

  async getChatHistory(): Promise<AIChatMessage[]> {
    const res = await fetch(`${BASE_URL}/ai/history`);
    return handleResponse<AIChatMessage[]>(res);
  },

  async sendAIChatQuery(query: string): Promise<AIChatMessage> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return handleResponse<AIChatMessage>(res);
  },

  async scanQRCode(qrData: string): Promise<Medicine> {
    const res = await fetch(`${BASE_URL}/qr/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrData })
    });
    return handleResponse<Medicine>(res);
  }
};
