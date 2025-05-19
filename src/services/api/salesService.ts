import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export interface Sale {
  id: number;
  seller_id: number;
  seller: {
    id: number;
    name: string;
    email: string;
  };
  amount: number;
  commission: number;
  sale_date: string;
  created_at: string;
  updated_at: string;
}

export interface SaleRequest {
  seller_id: number;
  amount: number;
  sale_date: string;
}

export interface SalesResponse {
  data: Sale[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const salesService = {
  async fetchSales(page = 1, filters: Record<string, any> = {}) {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    
    // Adicionar filtros à query string
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) queryParams.append(key, String(value));
    });
    
    const response = await axios.get(`${API_URL}/sales?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  },
  
  async fetchSaleById(id: number) {
    const response = await axios.get(`${API_URL}/sales/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  },
  
  async createSale(saleData: SaleRequest) {
    const response = await axios.post(`${API_URL}/sales`, saleData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  },
  
  async updateSale(id: number, saleData: Partial<SaleRequest>) {
    const response = await axios.put(`${API_URL}/sales/${id}`, saleData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  },
  
  async deleteSale(id: number) {
    const response = await axios.delete(`${API_URL}/sales/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  }
};

export default salesService;
