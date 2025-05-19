import { defineStore } from 'pinia';
import salesService, { Sale, SaleRequest } from '@/services/api/salesService';

interface SalesState {
  sales: Sale[];
  currentSale: Sale | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  loading: boolean;
  error: string | null;
}

export const useSalesStore = defineStore('sales', {
  state: (): SalesState => ({
    sales: [],
    currentSale: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    },
    loading: false,
    error: null
  }),
  
  getters: {
    getSales: (state) => state.sales,
    getCurrentSale: (state) => state.currentSale,
    getPagination: (state) => state.pagination,
    isLoading: (state) => state.loading
  },
  
  actions: {
    async fetchSales(page = 1, filters = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await salesService.fetchSales(page, filters);
        const paginatedData = response.data as any;
        
        // Garantir que sales sempre seja um array, mesmo se data for undefined
        this.sales = Array.isArray(paginatedData?.data) ? paginatedData.data : [];
        this.pagination = {
          currentPage: paginatedData?.meta?.current_page || paginatedData?.current_page || 1,
          totalPages: paginatedData?.meta?.last_page || paginatedData?.last_page || 1,
          totalItems: paginatedData?.meta?.total || paginatedData?.total || 0
        };
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao buscar vendas';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSaleById(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await salesService.fetchSaleById(id);
        this.currentSale = response.data as Sale;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao buscar venda';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createSale(saleData: SaleRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await salesService.createSale(saleData);
        // Atualiza a lista após criar
        await this.fetchSales(this.pagination.currentPage);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao criar venda';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateSale(id: number, saleData: SaleRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await salesService.updateSale(id, saleData);
        
        // Atualiza a venda atual se for a mesma
        if (this.currentSale && this.currentSale.id === id) {
          this.currentSale = { ...this.currentSale, ...saleData } as Sale;     }
        
        // Atualiza a lista
        await this.fetchSales(this.pagination.currentPage);
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao atualizar venda';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteSale(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await salesService.deleteSale(id);
        
        // Limpa a venda atual se for a mesma
        if (this.currentSale && this.currentSale.id === id) {
          this.currentSale = null;
        }
        
        // Atualiza a lista
        await this.fetchSales(this.pagination.currentPage);
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao excluir venda';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
