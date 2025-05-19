import { defineStore } from 'pinia';
import { reportsService } from '@/services/api/reportsService';

interface ReportsState {
  loading: boolean;
  error: string | null;
  lastReport: any | null;
}

export const useReportsStore = defineStore('reports', {
  state: (): ReportsState => ({
    loading: false,
    error: null,
    lastReport: null
  }),
  
  getters: {
    isLoading: (state) => state.loading
  },
  
  actions: {
    async sendDailyReports(date: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await reportsService.sendDailyReports(date);
        this.lastReport = response;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao enviar relatórios diários';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async resendReport(sellerId: number, date: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await reportsService.resendReport(sellerId, date);
        this.lastReport = response;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao reenviar relatório';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
