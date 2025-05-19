import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export interface Seller {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  total_sales: number;
  total_amount: number;
  total_commission: number;
}

export interface SellerRequest {
  name: string;
  email: string;
}

export interface SellerResponse {
  status: string;
  message?: string;
  data: Seller | Seller[] | PaginatedResponse<Seller>;
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

export const sellersService = {
  getAll: async (page = 1): Promise<SellerResponse> => {
    const response = await axios.get(`${API_URL}/sellers?page=${page}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  getById: async (id: number): Promise<SellerResponse> => {
    const response = await axios.get(`${API_URL}/sellers/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  create: async (sellerData: SellerRequest): Promise<SellerResponse> => {
    const response = await axios.post(`${API_URL}/sellers`, sellerData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  update: async (id: number, sellerData: SellerRequest): Promise<SellerResponse> => {
    const response = await axios.put(`${API_URL}/sellers/${id}`, sellerData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  delete: async (id: number): Promise<SellerResponse> => {
    const response = await axios.delete(`${API_URL}/sellers/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  getSales: async (sellerId: number, page = 1): Promise<any> => {
    const response = await axios.get(`${API_URL}/sellers/${sellerId}/sales?page=${page}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  sendReport: async (sellerId: number, date: string): Promise<any> => {
    const response = await axios.post(`${API_URL}/sellers/${sellerId}/report`, { date }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};
