import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

// Initialize state from localStorage if available
const token = localStorage.getItem('auth_token');
let initialUser = null;
let initialAuth = false;

if (token) {
  try {
    // Try to decode the token to check if it's valid JWT format
    const [header, payload] = token.split('.').slice(0, 2);
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if token is expired
    if (decodedPayload.exp * 1000 > Date.now()) {
      initialAuth = true;
      initialUser = {
        id: decodedPayload.sub,
        email: decodedPayload.email
      };
    } else {
      // Clear expired token
      localStorage.removeItem('auth_token');
    }
  } catch (e) {
    // Clear invalid token
    localStorage.removeItem('auth_token');
  }
}

const initialState: AuthState = {
  isAuthenticated: initialAuth,
  token: initialAuth ? token : null,
  user: initialUser,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserProfile }>
    ) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('auth_token', token);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
    },
  },
});

export const { setCredentials, setLoading, setError, logout } = authSlice.actions;

export default authSlice.reducer; 