import { defineStore } from 'pinia';
import { usersService, User, UserRequest } from '@/services/api/usersService';

interface UsersState {
  users: User[];
  currentUser: User | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  loading: boolean;
  error: string | null;
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    currentUser: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    },
    loading: false,
    error: null
  }),
  
  getters: {
    getUsers: (state) => state.users,
    getCurrentUser: (state) => state.currentUser,
    getPagination: (state) => state.pagination,
    isLoading: (state) => state.loading
  },
  
  actions: {
    async fetchUsers(page = 1) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await usersService.getAll(page);
        const paginatedData = response.data as any;
        
        this.users = paginatedData.data;
        this.pagination = {
          currentPage: paginatedData.current_page,
          totalPages: paginatedData.last_page,
          totalItems: paginatedData.total
        };
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao buscar usuários';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUserById(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await usersService.getById(id);
        this.currentUser = response.data as User;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao buscar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createUser(userData: UserRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await usersService.create(userData);
        // Atualiza a lista após criar
        await this.fetchUsers(this.pagination.currentPage);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao criar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateUser(id: number, userData: Partial<UserRequest>) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await usersService.update(id, userData);
        
        // Atualiza o usuário atual se for o mesmo
        if (this.currentUser && this.currentUser.id === id) {
          this.currentUser = response.data as User;
        }
        
        // Atualiza a lista
        await this.fetchUsers(this.pagination.currentPage);
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao atualizar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteUser(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await usersService.delete(id);
        
        // Limpa o usuário atual se for o mesmo
        if (this.currentUser && this.currentUser.id === id) {
          this.currentUser = null;
        }
        
        // Atualiza a lista
        await this.fetchUsers(this.pagination.currentPage);
        
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao excluir usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
