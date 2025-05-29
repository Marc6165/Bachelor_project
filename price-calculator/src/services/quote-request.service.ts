import { authService } from "./auth.service";

export interface QuoteRequest {
  customerType: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  note?: string;
  service: string;
  estimatedPrice: number;
  parameters: Record<string, any>;
  status: 'Pending' | 'Accepted' | 'Dismissed' | 'Waiting';
  id?: string;
  _id?: string;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  quotes: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class QuoteRequestService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  private normalizeQuote(quote: QuoteRequest): QuoteRequest {
    if (!quote) return quote;
    console.log('Normalizing quote:', quote);
    if (quote._id && !quote.id) {
      const normalized = { ...quote, id: quote._id };
      console.log('Normalized quote:', normalized);
      return normalized;
    }
    return quote;
  }

  private normalizeQuotes(quotes: QuoteRequest[]): QuoteRequest[] {
    if (!Array.isArray(quotes)) {
      console.error('Expected quotes to be an array but got:', quotes);
      return [];
    }
    console.log('Normalizing quotes array:', quotes);
    return quotes.map(this.normalizeQuote.bind(this));
  }

  async submitQuoteRequest(request: Omit<QuoteRequest, 'status' | 'id' | '_id' | 'createdAt'>): Promise<QuoteRequest> {
    const token = await authService.getToken();
    console.log('Submitting quote request:', request);
    
    const response = await fetch(`${this.baseUrl}/api/quote-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...request,
        status: 'Pending',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to submit quote request:', error);
      throw new Error('Failed to submit quote request');
    }

    const data = await response.json();
    console.log('Quote request response:', data);
    return this.normalizeQuote(data);
  }

  async getQuoteRequests(page: number = 1, limit: number = 10): Promise<PaginatedResponse<QuoteRequest>> {
    const token = await authService.getToken();
    console.log('Token for request:', token ? 'Present' : 'Missing');
    console.log('Fetching quote requests, page:', page, 'limit:', limit);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/quote-requests?page=${page}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch quote requests:', errorText);
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || errorJson.error || 'Failed to fetch quote requests');
        } catch (e) {
          // If not JSON, use text as is
          throw new Error(errorText || 'Failed to fetch quote requests');
        }
      }

      const data = await response.json();
      console.log('Raw quote requests response:', data);
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        // If the response is an array, wrap it in a paginated format
        console.log('Converting array response to paginated format');
        const normalizedData = {
          quotes: this.normalizeQuotes(data),
          pagination: {
            total: data.length,
            page: 1,
            limit: data.length,
            pages: 1
          }
        };
        console.log('Normalized response:', normalizedData);
        return normalizedData;
      } else if (data.quotes && Array.isArray(data.quotes)) {
        // If it's already in paginated format
        console.log('Response is already in paginated format');
        const normalizedData = {
          ...data,
          quotes: this.normalizeQuotes(data.quotes)
        };
        console.log('Normalized response:', normalizedData);
        return normalizedData;
      }

      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error in getQuoteRequests:', error);
      throw error;
    }
  }

  async updateQuoteRequest(quoteId: string, update: Partial<QuoteRequest>): Promise<QuoteRequest> {
    const token = await authService.getToken();
    // Use _id if available, otherwise use id
    const id = quoteId || update._id || update.id;
    console.log('Updating quote request:', id, 'with:', update);
    console.log('Token for update:', token ? 'Present' : 'Missing');
    
    if (!id) {
      console.error('No valid ID provided for quote update');
      throw new Error('No valid ID provided for quote update');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/quote-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      console.log('Update response status:', response.status);
      console.log('Update response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update quote request:', errorText);
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || errorJson.error || 'Failed to update quote request');
        } catch (e) {
          // If not JSON, use text as is
          throw new Error(errorText || 'Failed to update quote request');
        }
      }

      const data = await response.json();
      console.log('Quote request update raw response:', data);
      const normalized = this.normalizeQuote(data);
      console.log('Quote request update normalized response:', normalized);
      return normalized;
    } catch (error) {
      console.error('Error in updateQuoteRequest:', error);
      throw error;
    }
  }
}

export const quoteRequestService = new QuoteRequestService(); 