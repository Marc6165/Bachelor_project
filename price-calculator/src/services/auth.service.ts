import { store } from '../store';
import { setCredentials, setLoading, setError, logout } from '../store/slices/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
}

class AuthService {
  private static instance: AuthService;
  private readonly API_URL = "http://localhost:5000/api/auth";

  private constructor() {
    // Token validation is now handled in the Redux store initialization
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getToken(): string | null {
    return store.getState().auth.token;
  }

  async register(credentials: RegisterCredentials): Promise<{ userId: string; email: string }> {
    try {
      store.dispatch(setLoading(true));
      console.log('Attempting to register user:', credentials.email);
      const response = await fetch(`${this.API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      store.dispatch(setError(error instanceof Error ? error.message : "Registration failed"));
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      store.dispatch(setLoading(false));
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      store.dispatch(setLoading(true));
      console.log('Attempting to login user:', credentials.email);
      const response = await fetch(`${this.API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      console.log('Login successful, setting token and user data');
      
      // Update Redux state with token and user data
      store.dispatch(setCredentials({ 
        token: data.token, 
        user: data.user 
      }));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      store.dispatch(setError(error instanceof Error ? error.message : "Login failed"));
      throw new Error(error instanceof Error ? error.message : "Login failed");
    } finally {
      store.dispatch(setLoading(false));
    }
  }

  async getProfile(): Promise<UserProfile> {
    const token = this.getToken();
    if (!token) {
      console.error('Attempted to get profile without token');
      throw new Error("Not authenticated");
    }

    try {
      store.dispatch(setLoading(true));
      console.log('Fetching user profile');
      const response = await fetch(`${this.API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Profile fetch returned 401, clearing token');
          store.dispatch(logout());
          throw new Error("Session expired");
        }
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch profile");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Profile fetch error:', error);
      store.dispatch(setError(error instanceof Error ? error.message : "Failed to fetch profile"));
      throw new Error(error instanceof Error ? error.message : "Failed to fetch profile");
    } finally {
      store.dispatch(setLoading(false));
    }
  }

  isAuthenticated(): boolean {
    return store.getState().auth.isAuthenticated;
  }

  logout(): void {
    store.dispatch(logout());
  }
}

export const authService = AuthService.getInstance(); 