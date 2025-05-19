import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  status: string;
  message?: string;
  data: User | User[] | PaginatedResponse<User>;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const usersService = {
  getAll: async (page = 1): Promise<UserResponse> => {
    const response = await axios.get(`${API_URL}/users?page=${page}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  getById: async (id: number): Promise<UserResponse> => {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  create: async (userData: UserRequest): Promise<UserResponse> => {
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  update: async (id: number, userData: Partial<UserRequest>): Promise<UserResponse> => {
    const response = await axios.put(`${API_URL}/users/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  delete: async (id: number): Promise<UserResponse> => {
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};
