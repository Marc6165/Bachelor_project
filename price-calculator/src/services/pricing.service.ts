import { authService } from "./auth.service";

export interface CalculateQuoteRequest {
  serviceType: string;
  parameters: Record<string, any>;
}

export interface QuoteResponse {
  quoteId: string;
  priceDetails: {
    total: number;
    breakdown: Record<string, number>;
    currency: string;
  };
}

export interface Quote {
  id: string;
  serviceType: string;
  parameters: Record<string, any>;
  priceDetails: {
    total: number;
    breakdown: Record<string, number>;
    currency: string;
  };
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

class PricingService {
  private static instance: PricingService;
  private readonly API_URL = "http://localhost:3000/api/pricing"; // Assuming pricing service runs on port 5001

  private constructor() {}

  static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
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

  async calculateQuote(request: CalculateQuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await fetch(`${this.API_URL}/calculate`, {
        method: "POST",
        headers: this.getAuthHeader(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to calculate quote");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to calculate quote");
    }
  }

  async getQuote(quoteId: string): Promise<Quote> {
    try {
      const response = await fetch(`${this.API_URL}/quotes/${quoteId}`, {
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch quote");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to fetch quote");
    }
  }
}

export const pricingService = PricingService.getInstance(); 