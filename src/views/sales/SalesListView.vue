<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Vendas</h1>
      <router-link 
        to="/sales/create" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Nova Venda
      </router-link>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-4 md:mb-0 md:w-1/3">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch" 
            placeholder="Buscar por vendedor" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Data</label>
            <input 
              type="date" 
              v-model="dateFilter" 
              @change="handleSearch" 
              class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Ordenar por</label>
            <select 
              v-model="sortBy" 
              @change="handleSort" 
              class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="sale_date">Data</option>
              <option value="amount">Valor</option>
              <option value="commission">Comissão</option>
            </select>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="sales.length === 0" class="text-gray-500 text-center py-8">
        Nenhuma venda encontrada
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2 px-4 border-b text-left">ID</th>
              <th class="py-2 px-4 border-b text-left">Vendedor</th>
              <th class="py-2 px-4 border-b text-left">Valor</th>
              <th class="py-2 px-4 border-b text-left">Comissão</th>
              <th class="py-2 px-4 border-b text-left">Data</th>
              <th class="py-2 px-4 border-b text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id" class="hover:bg-gray-100">
              <td class="py-2 px-4 border-b">{{ sale.id }}</td>
              <td class="py-2 px-4 border-b">{{ sale.seller.name }}</td>
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
import { useSalesStore } from '@/stores/useSalesStore';
import { Sale } from '@/services/api/salesService';

export default defineComponent({
  name: 'SalesListView',
  setup() {
    const salesStore = useSalesStore();
    const searchQuery = ref('');
    const dateFilter = ref('');
    const sortBy = ref('sale_date');
    const showDeleteModal = ref(false);
    const saleToDelete = ref<Sale | null>(null);
    const toast = ref({
      show: false,
      message: '',
      type: 'success' as 'success' | 'error'
    });

    const loading = computed(() => salesStore.isLoading);
    const sales = computed(() => salesStore.getSales);
    const pagination = computed(() => salesStore.getPagination);

    const fetchSales = async (page = 1) => {
      try {
        const filters: Record<string, string | number> = {};
        
        if (searchQuery.value) {
          filters.search = searchQuery.value;
        }
        
        if (dateFilter.value) {
          filters.date = dateFilter.value;
        }
        
        if (sortBy.value) {
          filters.sort_by = sortBy.value;
        }
        
        await salesStore.fetchSales(page, filters);
      } catch (error) {
        showToast('Erro ao carregar vendas', 'error');
      }
    };

    const handleSearch = () => {
      fetchSales(1);
    };

    const handleSort = () => {
      fetchSales(pagination.value.currentPage);
    };

    const changePage = (page: number) => {
      if (page < 1 || page > pagination.value.totalPages) return;
      fetchSales(page);
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
      fetchSales();
    });

    return {
      sales,
      loading,
      pagination,
      searchQuery,
      dateFilter,
      sortBy,
      showDeleteModal,
      toast,
      handleSearch,
      handleSort,
      changePage,
      confirmDelete,
      deleteSale,
      formatCurrency,
      formatDate
    };
  }
});
</script>
