<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Vendas do Vendedor</h1>
      <router-link 
        to="/sellers" 
        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        Voltar
      </router-link>
    </div>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-xl font-bold mb-4">Informações do Vendedor</h2>
        <div v-if="seller" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span class="font-semibold">Nome:</span> {{ seller.name }}</p>
            <p><span class="font-semibold">Email:</span> {{ seller.email }}</p>
          </div>
          <div>
            <p><span class="font-semibold">Total de Vendas:</span> {{ seller.total_sales }}</p>
            <p><span class="font-semibold">Valor Total:</span> R$ {{ formatCurrency(seller.total_amount) }}</p>
            <p><span class="font-semibold">Comissão Total:</span> R$ {{ formatCurrency(seller.total_commission) }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="mb-4 flex justify-between items-center">
          <h2 class="text-xl font-bold">Vendas</h2>
          <router-link 
            to="/sales/create" 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nova Venda
          </router-link>
        </div>
        
        <div v-if="sales.length === 0" class="text-gray-500 text-center py-8">
          Nenhuma venda encontrada para este vendedor
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">ID</th>
                <th class="py-2 px-4 border-b text-left">Valor</th>
                <th class="py-2 px-4 border-b text-left">Comissão</th>
                <th class="py-2 px-4 border-b text-left">Data</th>
                <th class="py-2 px-4 border-b text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in sales" :key="sale.id" class="hover:bg-gray-100">
                <td class="py-2 px-4 border-b">{{ sale.id }}</td>
                <td class="py-2 px-4 border-b">R$ {{ formatCurrency(sale.amount) }}</td>
                <td class="py-2 px-4 border-b">R$ {{ formatCurrency(sale.commission) }}</td>
                <td class="py-2 px-4 border-b">{{ formatDate(sale.sale_date) }}</td>
                <td class="py-2 px-4 border-b text-center">
                  <div class="flex justify-center space-x-2">
                    <router-link 
                      :to="`/sales/${sale.id}/edit`" 
                      class="text-yellow-500 hover:text-yellow-700"
                      title="Editar"
                    >
                      <span class="material-icons text-sm">edit</span>
                    </router-link>
                    
                    <button 
                      @click="confirmDelete(sale)" 
                      class="text-red-500 hover:text-red-700"
                      title="Excluir"
                    >
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginação -->
        <div v-if="sales.length > 0" class="mt-4 flex justify-between items-center">
          <div>
            Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }} resultados
          </div>
          <div class="flex space-x-2">
            <button 
              @click="changePage(pagination.currentPage - 1)" 
              :disabled="pagination.currentPage === 1"
              class="px-3 py-1 rounded border" 
              :class="pagination.currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-100'"
            >
              Anterior
            </button>
            <button 
              @click="changePage(pagination.currentPage + 1)" 
              :disabled="pagination.currentPage === pagination.totalPages"
              class="px-3 py-1 rounded border" 
              :class="pagination.currentPage === pagination.totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-100'"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmação de exclusão -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Confirmar Exclusão</h2>
        <p class="mb-6">Tem certeza que deseja excluir esta venda?</p>
        <div class="flex justify-end space-x-2">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button 
            @click="deleteSale" 
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
    
    <!-- Toast de notificação -->
    <div 
      v-if="toast.show" 
      class="fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg z-50"
      :class="{
        'bg-green-500 text-white': toast.type === 'success',
        'bg-red-500 text-white': toast.type === 'error'
      }"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSellersStore } from '@/stores/useSellersStore';
import { useSalesStore } from '@/stores/useSalesStore';
import { Sale } from '@/services/api/salesService';

export default defineComponent({
  name: 'SalesBySellerView',
  setup() {
    const route = useRoute();
    const sellersStore = useSellersStore();
    const salesStore = useSalesStore();
    const loading = ref(true);
    const sales = ref<Sale[]>([]);
    const sellerId = Number(route.params.id);
    const showDeleteModal = ref(false);
    const saleToDelete = ref<Sale | null>(null);
    const pagination = ref({
      currentPage: 1,
      totalPages: 1,
      total: 0,
      from: 0,
      to: 0
    });
    
    const toast = ref({
      show: false,
      message: '',
      type: 'success' as 'success' | 'error'
    });

    const seller = computed(() => sellersStore.getCurrentSeller);

    const fetchSellerAndSales = async (page = 1) => {
      loading.value = true;
      try {
        // Buscar dados do vendedor
        await sellersStore.fetchSellerById(sellerId);
        
        // Buscar vendas do vendedor
        const response = await sellersStore.fetchSellerSales(sellerId, page);
        const data = response.data as any;
        
        sales.value = data.data;
        pagination.value = {
          currentPage: data.current_page,
          totalPages: data.last_page,
          total: data.total,
          from: data.from || 0,
          to: data.to || 0
        };
      } catch (error) {
        showToast('Erro ao carregar dados', 'error');
      } finally {
        loading.value = false;
      }
    };

    const changePage = (page: number) => {
      if (page < 1 || page > pagination.value.totalPages) return;
      fetchSellerAndSales(page);
    };

    const confirmDelete = (sale: Sale) => {
      saleToDelete.value = sale;
      showDeleteModal.value = true;
    };

    const deleteSale = async () => {
      if (!saleToDelete.value) return;
      
      try {
        await salesStore.deleteSale(saleToDelete.value.id);
        showToast('Venda excluída com sucesso', 'success');
        fetchSellerAndSales(pagination.value.currentPage);
      } catch (error) {
        showToast('Erro ao excluir venda', 'error');
      } finally {
        showDeleteModal.value = false;
        saleToDelete.value = null;
      }
    };

    const formatCurrency = (value: number): string => {
      return value.toFixed(2).replace('.', ',');
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    };

    const showToast = (message: string, type: 'success' | 'error') => {
      toast.value = {
        show: true,
        message,
        type
      };
      
      setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    };

    onMounted(() => {
      fetchSellerAndSales();
    });

    return {
      seller,
      sales,
      loading,
      pagination,
      showDeleteModal,
      toast,
      changePage,
      confirmDelete,
      deleteSale,
      formatCurrency,
      formatDate
    };
  }
});
</script>
