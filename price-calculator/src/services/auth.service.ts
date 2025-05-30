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
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ userId: string; email: string }> {
    try {
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
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
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
      this.setToken(data.token);
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  async getProfile(): Promise<UserProfile> {
    if (!this.token) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await fetch(`${this.API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          throw new Error("Session expired");
        }
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch profile");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to fetch profile");
    }
  }

  logout(): void {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = AuthService.getInstance(); 