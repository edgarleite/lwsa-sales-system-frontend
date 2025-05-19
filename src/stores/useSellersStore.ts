import { defineStore } from 'pinia';
import { sellersService, Seller, SellerRequest } from '@/services/api/sellersService';

interface SellersState {
  sellers: Seller[];
  currentSeller: Seller | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  loading: boolean;
  error: string | null;
}

export const useSellersStore = defineStore('sellers', {
  state: (): SellersState => ({
    sellers: [],
    currentSeller: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    },
    loading: false,
    error: null
  }),
  
  getters: {
    getSellers: (state) => state.sellers,
    getCurrentSeller: (state) => state.currentSeller,
    getPagination: (state) => state.pagination,
    isLoading: (state) => state.loading
  },
  
  actions: {
    async fetchSellers(page = 1) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await sellersService.getAll(page);
        const paginatedData = response.data as any;
        
        // Garantir que sellers sempre seja um array, mesmo se data for undefined
        this.sellers = Array.isArray(paginatedData?.data) ? paginatedData.data : [];
        this.pagination = {
          currentPage: paginatedData?.meta?.current_page || paginatedData?.current_page || 1,
          totalPages: paginatedData?.meta?.last_page || paginatedData?.last_page || 1,
          totalItems: paginatedData?.meta?.total || paginatedData?.total || 0
        };
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao buscar vendedores';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSellerById(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await sellersService.getById(id);
        this.currentSeller = response.data as Seller;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao buscar vendedor';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createSeller(sellerData: SellerRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await sellersService.create(sellerData);
        // Atualiza a lista após criar
        await this.fetchSellers(this.pagination.currentPage);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao criar vendedor';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateSeller(id: number, sellerData: SellerRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await sellersService.update(id, sellerData);
        
        // Atualiza o vendedor atual se for o mesmo
        if (this.currentSeller && this.currentSeller.id === id) {
          this.currentSeller = response.data as Seller;
        }
        
        // Atualiza a lista
        await this.fetchSellers(this.pagination.currentPage);
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao atualizar vendedor';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteSeller(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await sellersService.delete(id);
        
        // Limpa o vendedor atual se for o mesmo
        if (this.currentSeller && this.currentSeller.id === id) {
          this.currentSeller = null;
        }
        
        // Atualiza a lista
        await this.fetchSellers(this.pagination.currentPage);
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao excluir vendedor';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async sendReport(sellerId: number, date: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await sellersService.sendReport(sellerId, date);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao enviar relatório';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSellerSales(sellerId: number, page = 1) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await sellersService.getSales(sellerId, page);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao buscar vendas do vendedor';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
