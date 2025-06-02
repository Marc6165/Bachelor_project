import axios from 'axios';
import type { CalculatorConfig } from '../features/calculator';
import { authService } from './auth.service';

const API_BASE_URL = 'http://localhost:3000/api/calculators';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove withCredentials since we're using token-based auth
  withCredentials: false
});

// Add an interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
  if (authService.isAuthenticated()) {
    if (!config.headers) {
      config.headers = {};
    }
    const token = authService.getToken();
    if (token) {
      // Debug token format
      console.log('Raw token:', token);
      console.log('Token parts:', token.split('.').length);
      
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // Debug final header
      console.log('Final Authorization header:', config.headers['Authorization']);
      
      console.log('Request URL:', config.baseURL + (config.url || ''));
      console.log('Request method:', config.method?.toUpperCase());
      console.log('Full headers:', JSON.stringify(config.headers, null, 2));
      console.log('Request payload:', config.data);

      // Decode and log JWT payload (for debugging)
      try {
        const [header, payload] = token.split('.').slice(0, 2);
        const decodedHeader = JSON.parse(atob(header));
        const decodedPayload = JSON.parse(atob(payload));
        console.log('Token header:', decodedHeader);
        console.log('Token payload:', {
          ...decodedPayload,
          exp: new Date(decodedPayload.exp * 1000).toISOString(),
          iat: new Date(decodedPayload.iat * 1000).toISOString()
        });
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
  }
  return config;
});

// Add a response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      requestHeaders: error.config?.headers
    });
    return Promise.reject(error);
  }
);

console.log(authService.isAuthenticated());
console.log(localStorage.getItem('auth_token'));

export const calculatorApi = {
  createCalculator: async (config: Omit<CalculatorConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Attempting to create calculator with config:', config);
      const response = await api.post('/create', config);
      console.log('Create calculator response:', response.data);
      
      // Transform _id to id if necessary
      const data = response.data as any;
      if (data._id && !data.id) {
        data.id = data._id;
        delete data._id;
      }
      
      return data as CalculatorConfig;
    } catch (error: any) {
      console.error('Error creating calculator:');
      console.error('Status:', error.response?.status);
      console.error('Status text:', error.response?.statusText);
      console.error('Error data:', error.response?.data);
      console.error('Response headers:', error.response?.headers);
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? 
            `${error.config.headers.Authorization.substring(0, 20)}...` : 
            'REDACTED'
        },
        data: error.config?.data
      });
      throw error;
    }
  },

  getUserCalculators: async () => {
    const response = await api.get('/user');
    const data = response.data as any[];
    // Transform _id to id if necessary
    data.forEach(item => {
      if (item._id && !item.id) {
        item.id = item._id;
        delete item._id;
      }
    });
    return data as CalculatorConfig[];
  },

  getCalculator: async (id: string) => {
    const response = await api.get(`/${id}`);
    const data = response.data as any;
    // Transform _id to id if necessary
    if (data._id && !data.id) {
      data.id = data._id;
      delete data._id;
    }
    return data as CalculatorConfig;
  },

  updateCalculator: async (id: string, config: Partial<CalculatorConfig>) => {
    const response = await api.put(`/${id}`, config);
    const data = response.data as any;
    // Transform _id to id if necessary
    if (data._id && !data.id) {
      data.id = data._id;
      delete data._id;
    }
    return data as CalculatorConfig;
  },

  deleteCalculator: async (id: string) => {
    await api.delete(`/${id}`);
    return true;
  },
}; 