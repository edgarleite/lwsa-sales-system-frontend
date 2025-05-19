import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export interface ReportRequest {
  date: string;
}

export interface ReportResponse {
  status: string;
  message: string;
  data: {
    total_sellers?: number;
    total_sales: number;
    total_amount: number;
    total_commission: number;
    date: string;
    seller_id?: number;
    seller_name?: string;
    seller_email?: string;
  };
}

export const reportsService = {
  sendDailyReports: async (date: string): Promise<ReportResponse> => {
    const response = await axios.post(`${API_URL}/reports/daily`, { date }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  
  resendReport: async (sellerId: number, date: string): Promise<ReportResponse> => {
    const response = await axios.post(`${API_URL}/sellers/${sellerId}/report`, { date }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};
