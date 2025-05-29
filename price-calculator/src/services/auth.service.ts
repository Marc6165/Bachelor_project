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
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private readonly API_URL = "http://localhost:5000/api/auth";

  private constructor() {
    // Try to load token from localStorage on initialization
    this.token = localStorage.getItem("auth_token");
    console.log('Auth service initialized, token present:', !!this.token);
    if (this.token) {
      try {
        // Try to decode the token to check if it's valid JWT format
        const [header, payload] = this.token.split('.').slice(0, 2);
        const decodedHeader = JSON.parse(atob(header));
        const decodedPayload = JSON.parse(atob(payload));
        console.log('Token format valid, expiry:', new Date(decodedPayload.exp * 1000).toISOString());
        
        // Check if token is expired
        if (decodedPayload.exp * 1000 < Date.now()) {
          console.log('Token is expired, clearing...');
          this.setToken(null);
        }
      } catch (e) {
        console.error('Invalid token format in localStorage, clearing...', e);
        this.setToken(null);
      }
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setToken(token: string | null) {
    console.log('Setting token:', token ? 'Present' : 'Cleared');
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  getToken(): string | null {
    if (this.token) {
      try {
        // Verify token format and expiry when getting
        const [header, payload] = this.token.split('.').slice(0, 2);
        const decodedPayload = JSON.parse(atob(payload));
        
        if (decodedPayload.exp * 1000 < Date.now()) {
          console.log('Token expired when getting, clearing...');
          this.setToken(null);
          return null;
        }
      } catch (e) {
        console.error('Invalid token format when getting, clearing...', e);
        this.setToken(null);
        return null;
      }
    }
    return this.token;
  }

  async register(credentials: RegisterCredentials): Promise<{ userId: string; email: string }> {
    try {
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
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
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
      console.log('Login successful, setting token');
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  async getProfile(): Promise<UserProfile> {
    if (!this.token) {
      console.error('Attempted to get profile without token');
      throw new Error("Not authenticated");
    }

    try {
      console.log('Fetching user profile');
      const response = await fetch(`${this.API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Profile fetch returned 401, clearing token');
          this.setToken(null);
          throw new Error("Session expired");
        }
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch profile");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw new Error(error instanceof Error ? error.message : "Failed to fetch profile");
    }
  }

  logout(): void {
    console.log('Logging out, clearing token');
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    console.log('Checking authentication:', hasToken);
    return hasToken;
  }
}

export const authService = AuthService.getInstance(); 