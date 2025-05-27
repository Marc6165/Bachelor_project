import { authService } from "./auth.service";

export interface CustomerDetails {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface CreateInvoiceRequest {
  quoteId: string;
  customerDetails: CustomerDetails;
}

export interface Invoice {
  id: string;
  quoteId: string;
  customerDetails: CustomerDetails;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  createdAt: string;
}

class InvoiceService {
  private static instance: InvoiceService;
  private readonly API_URL = "http://localhost:5002/api/invoices"; // Assuming invoice service runs on port 5002

  private constructor() {}

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  private getAuthHeader(): HeadersInit {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async createInvoice(request: CreateInvoiceRequest): Promise<Invoice> {
    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: this.getAuthHeader(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create invoice");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to create invoice");
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await fetch(`${this.API_URL}/${invoiceId}`, {
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch invoice");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to fetch invoice");
    }
  }

  async listInvoices(): Promise<Invoice[]> {
    try {
      const response = await fetch(this.API_URL, {
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch invoices");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to fetch invoices");
    }
  }
}

export const invoiceService = InvoiceService.getInstance(); 