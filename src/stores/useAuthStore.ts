import { defineStore } from 'pinia';
import { authService, LoginRequest, RegisterRequest, AuthResponse } from '@/services/api/authService';

interface AuthState {
  token: string | null;
  user: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: {
      id: null,
      name: null,
      email: null
    },
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null
  }),
  
  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated,
    isLoading: (state) => state.loading
  },
  
  actions: {
    async login(credentials: LoginRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.login(credentials);
        this.setAuthData(response);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao fazer login';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData: RegisterRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.register(userData);
        this.setAuthData(response);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao registrar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
      this.loading = true;
      
      try {
        await authService.logout();
        this.clearAuthData();
      } catch (error) {
        // Mesmo com erro, limpa os dados locais
        this.clearAuthData();
      } finally {
        this.loading = false;
      }
    },
    
    async refreshToken() {
      if (!this.token) return;
      
      this.loading = true;
      
      try {
        const response = await authService.refreshToken();
        this.setAuthData(response);
        return response;
      } catch (error) {
        this.clearAuthData();
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCurrentUser() {
      if (!this.token) return;
      
      this.loading = true;
      
      try {
        const response = await authService.getCurrentUser();
        
        // Tratamento robusto para múltiplos formatos possíveis da resposta
        // Usando tipagem explícita e checagem de propriedades para evitar erros TS2339
        let id: number | null = null;
        let name: string | null = null;
        let email: string | null = null;
        
        // Função auxiliar para extrair dados do usuário com segurança
        const extractUserData = (obj: any) => {
          if (obj && typeof obj === 'object') {
            if ('id' in obj) id = obj.id;
            if ('name' in obj) name = obj.name;
            if ('email' in obj) email = obj.email;
          }
        };
        
        if (response && typeof response === 'object') {
          // Caso 1: A resposta é o próprio objeto de usuário
          if ('id' in response && 'name' in response && 'email' in response) {
            extractUserData(response);
          } 
          // Caso 2: A resposta tem um campo data que contém o objeto de usuário
          else if ('data' in response && response.data && typeof response.data === 'object') {
            extractUserData(response.data);
          }
          // Caso 3: Tentar extrair de qualquer forma
          else {
            console.error('Formato de resposta inesperado:', response);
            extractUserData(response);
          }
        } else {
          console.error('Resposta inválida:', response);
        }
        
        // Atualiza o usuário com os dados extraídos
        this.user = { id, name, email };
        
        return response;
      } catch (error) {
        this.clearAuthData();
      } finally {
        this.loading = false;
      }
    },
    
    setAuthData(response: any) {
      // Ajustado para o formato real da API
      const token = response.access_token || (response.data && response.data.token);
      this.token = token;
      this.user = response.user || (response.data && response.data.user);
      this.isAuthenticated = true;
      localStorage.setItem('token', token);
      console.log('Token armazenado:', token);
      console.log('Usuário armazenado:', this.user);
    },
    
    clearAuthData() {
      this.token = null;
      this.user = {
        id: null,
        name: null,
        email: null
      };
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  },
  
  persist: true
});
