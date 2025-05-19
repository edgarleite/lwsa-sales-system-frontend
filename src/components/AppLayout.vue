<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-md">
      <div class="p-4">
        <h1 class="text-xl font-bold">Sistema de Vendas</h1>
      </div>
      <nav class="mt-4">
        <router-link to="/" class="block py-2 px-4 hover:bg-gray-200" active-class="bg-blue-500 text-white">
          Dashboard
        </router-link>
        <router-link to="/sellers" class="block py-2 px-4 hover:bg-gray-200" active-class="bg-blue-500 text-white">
          Vendedores
        </router-link>
        <router-link to="/sales" class="block py-2 px-4 hover:bg-gray-200" active-class="bg-blue-500 text-white">
          Vendas
        </router-link>
        <router-link to="/admin/reports" class="block py-2 px-4 hover:bg-gray-200" active-class="bg-blue-500 text-white">
          Relatórios
        </router-link>
        <router-link to="/admin/users" class="block py-2 px-4 hover:bg-gray-200" active-class="bg-blue-500 text-white">
          Usuários
        </router-link>
      </nav>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="bg-white shadow-md p-4 flex justify-between items-center">
        <h2 class="text-lg font-semibold">{{ pageTitle }}</h2>
        <div class="flex items-center">
          <span class="mr-4">{{ user?.name }}</span>
          <button 
            @click="logout" 
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Sair
          </button>
        </div>
      </header>
      
      <!-- Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default defineComponent({
  name: 'AppLayout',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    
    const pageTitle = computed(() => {
      const routeName = route.name as string;
      const titles: Record<string, string> = {
        'Dashboard': 'Dashboard',
        'SellersList': 'Vendedores',
        'SellerCreate': 'Novo Vendedor',
        'SellerEdit': 'Editar Vendedor',
        'SalesBySeller': 'Vendas por Vendedor',
        'SalesList': 'Vendas',
        'SalesCreate': 'Nova Venda',
        'SalesEdit': 'Editar Venda',
        'AdminReports': 'Relatórios',
        'UsersList': 'Usuários',
        'UserCreate': 'Novo Usuário',
        'UserEdit': 'Editar Usuário'
      };
      
      return titles[routeName] || 'Sistema de Vendas';
    });
    
    const user = computed(() => authStore.getUser);
    
    const logout = async () => {
      await authStore.logout();
      router.push('/login');
    };
    
    onMounted(() => {
      if (!authStore.isLoggedIn) {
        router.push('/login');
      } else {
        authStore.fetchCurrentUser();
      }
    });
    
    return {
      pageTitle,
      user,
      logout
    };
  }
});
</script>
