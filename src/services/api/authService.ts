import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: {
    id: number;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
    email_verified_at?: string | null;
  };
  // Formato alternativo para compatibilidade
  status?: string;
  message?: string;
  data?: {
    token?: string;
    token_type?: string;
    expires_in?: number;
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<any> => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },
  
  logout: async (): Promise<{ status: string; message: string }> => {
    const response = await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  getCurrentUser: async (): Promise<{ status: string; data: AuthResponse['user'] }> => {
    const response = await axios.get(`${API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};
