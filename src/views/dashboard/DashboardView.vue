<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-lg font-semibold mb-2">Total de Vendedores</h2>
          <p class="text-3xl font-bold text-blue-600">{{ stats.totalSellers }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-lg font-semibold mb-2">Total de Vendas</h2>
          <p class="text-3xl font-bold text-green-600">{{ stats.totalSales }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-lg font-semibold mb-2">Valor Total</h2>
          <p class="text-3xl font-bold text-purple-600">R$ {{ formatCurrency(stats.totalAmount) }}</p>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-semibold mb-4">Vendas Recentes</h2>
        <div v-if="loading" class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <div v-else-if="recentSales.length === 0" class="text-gray-500 text-center py-4">
          Nenhuma venda recente encontrada
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">Vendedor</th>
                <th class="py-2 px-4 border-b text-left">Valor</th>
                <th class="py-2 px-4 border-b text-left">Comissão</th>
                <th class="py-2 px-4 border-b text-left">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in recentSales" :key="sale.id" class="hover:bg-gray-100">
                <td class="py-2 px-4 border-b">{{ sale.seller.name }}</td>
                <td class="py-2 px-4 border-b">R$ {{ formatCurrency(sale.amount) }}</td>
                <td class="py-2 px-4 border-b">R$ {{ formatCurrency(sale.commission) }}</td>
                <td class="py-2 px-4 border-b">{{ formatDate(sale.sale_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Top Vendedores</h2>
        <div v-if="loading" class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <div v-else-if="topSellers.length === 0" class="text-gray-500 text-center py-4">
          Nenhum vendedor encontrado
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">Vendedor</th>
                <th class="py-2 px-4 border-b text-left">Total de Vendas</th>
                <th class="py-2 px-4 border-b text-left">Valor Total</th>
                <th class="py-2 px-4 border-b text-left">Comissão Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="seller in topSellers" :key="seller.id" class="hover:bg-gray-100">
                <td class="py-2 px-4 border-b">{{ seller.name }}</td>
                <td class="py-2 px-4 border-b">{{ seller.total_sales }}</td>
                <td class="py-2 px-4 border-b">R$ {{ formatCurrency(seller.total_amount) }}</td>
                <td class="py-2 px-4 border-b">R$ {{ formatCurrency(seller.total_commission) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useSalesStore } from '@/stores/useSalesStore';
import { useSellersStore } from '@/stores/useSellersStore';
import { Sale } from '@/services/api/salesService';
import { Seller } from '@/services/api/sellersService';

export default defineComponent({
  name: 'DashboardView',
  setup() {
    const salesStore = useSalesStore();
    const sellersStore = useSellersStore();
    const loading = ref(true);
    const recentSales = ref<Sale[]>([]);
    const topSellers = ref<Seller[]>([]);
    const stats = ref({
      totalSellers: 0,
      totalSales: 0,
      totalAmount: 0
    });

    const fetchDashboardData = async () => {
      loading.value = true;
      try {
        // Buscar vendas recentes
        const salesResponse = await salesStore.fetchSales(1);
        if (salesResponse) {
          recentSales.value = salesStore.getSales.slice(0, 5);
        }
        
        // Buscar top vendedores
        const sellersResponse = await sellersStore.fetchSellers(1);
        if (sellersResponse) {
          topSellers.value = sellersStore.getSellers
            .sort((a, b) => b.total_amount - a.total_amount)
            .slice(0, 5);
            
          // Calcular estatísticas
          stats.value.totalSellers = sellersStore.getPagination.totalItems;
          stats.value.totalSales = topSellers.value.reduce((sum, seller) => sum + seller.total_sales, 0);
          stats.value.totalAmount = topSellers.value.reduce((sum, seller) => sum + seller.total_amount, 0);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatCurrency = (value: number): string => {
      return value.toFixed(2).replace('.', ',');
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    };

    onMounted(() => {
      fetchDashboardData();
    });

    return {
      loading,
      recentSales,
      topSellers,
      stats,
      formatCurrency,
      formatDate
    };
  }
});
</script>
