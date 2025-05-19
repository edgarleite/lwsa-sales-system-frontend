<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Vendedores</h1>
      <router-link 
        to="/sellers/create" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Novo Vendedor
      </router-link>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-4 md:mb-0 md:w-1/3">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch" 
            placeholder="Buscar por nome ou email" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div class="flex items-center">
          <span class="mr-2">Ordenar por:</span>
          <select 
            v-model="sortBy" 
            @change="handleSort" 
            class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="name">Nome</option>
            <option value="email">Email</option>
            <option value="total_sales">Total de Vendas</option>
            <option value="total_amount">Valor Total</option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="sellers.values.length === 0" class="text-gray-500 text-center py-8">
        Nenhum vendedor encontrado
        <pre>{{ sellers }}</pre> 
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2 px-4 border-b text-left">Nome</th>
              <th class="py-2 px-4 border-b text-left">Email</th>
              <th class="py-2 px-4 border-b text-left">Total de Vendas</th>
              <th class="py-2 px-4 border-b text-left">Valor Total</th>
              <th class="py-2 px-4 border-b text-left">Comissão Total</th>
              <th class="py-2 px-4 border-b text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="seller in sellers" :key="seller.id" class="hover:bg-gray-100">
              <td class="py-2 px-4 border-b">{{ seller.name }}</td>
              <td class="py-2 px-4 border-b">{{ seller.email }}</td>
              <td class="py-2 px-4 border-b">{{ seller.total_sales }}</td>
              <td class="py-2 px-4 border-b">R$ {{ formatCurrency(seller.total_amount) }}</td>
              <td class="py-2 px-4 border-b">R$ {{ formatCurrency(seller.total_commission) }}</td>
              <td class="py-2 px-4 border-b text-center">
                <div class="flex justify-center space-x-2">
                  <router-link 
                    :to="`/sellers/${seller.id}/sales`" 
                    class="text-blue-500 hover:text-blue-700"
                    title="Ver vendas"
                  >
                    <span class="material-icons text-sm">visibility</span>
                  </router-link>
                  
                  <router-link 
                    :to="`/sellers/${seller.id}/edit`" 
                    class="text-yellow-500 hover:text-yellow-700"
                    title="Editar"
                  >
                    <span class="material-icons text-sm">edit</span>
                  </router-link>
                  
                  <button 
                    @click="confirmDelete(seller)" 
                    class="text-red-500 hover:text-red-700"
                    title="Excluir"
                  >
                    <span class="material-icons text-sm">delete</span>
                  </button>
                  
                  <button 
                    @click="sendReport(seller.id)" 
                    class="text-green-500 hover:text-green-700"
                    title="Enviar relatório"
                  >
                    <span class="material-icons text-sm">send</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginação -->
      <div v-if="sellers.length > 0" class="mt-4 flex justify-between items-center">
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
        <p class="mb-6">Tem certeza que deseja excluir o vendedor <strong>{{ sellerToDelete?.name }}</strong>?</p>
        <div class="flex justify-end space-x-2">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button 
            @click="deleteSeller" 
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
import { useSellersStore } from '@/stores/useSellersStore';
import { Seller } from '@/services/api/sellersService';

export default defineComponent({
  name: 'SellersListView',
  setup() {
    const sellersStore = useSellersStore();
    const searchQuery = ref('');
    const sortBy = ref('name');
    const showDeleteModal = ref(false);
    const sellerToDelete = ref<Seller | null>(null);
    const toast = ref({
      show: false,
      message: '',
      type: 'success'
    });

    const loading = computed(() => sellersStore.isLoading);
    const sellers = computed(() => sellersStore.getSellers);
    const pagination = computed(() => sellersStore.getPagination);

    console.log(sellers.value)

    const fetchSellers = async (page = 1) => {
      try {
        await sellersStore.fetchSellers(page);
      } catch (error) {
        showToast('Erro ao carregar vendedores', 'error');
      }
    };

    const handleSearch = () => {
      // Implementar lógica de busca (poderia ser feita no backend)
      fetchSellers(1);
    };

    const handleSort = () => {
      // Implementar lógica de ordenação (poderia ser feita no backend)
      fetchSellers(pagination.value.currentPage);
    };

    const changePage = (page: number) => {
      if (page < 1 || page > pagination.value.totalPages) return;
      fetchSellers(page);
    };

    const confirmDelete = (seller: Seller) => {
      sellerToDelete.value = seller;
      showDeleteModal.value = true;
    };

    const deleteSeller = async () => {
      if (!sellerToDelete.value) return;
      
      try {
        await sellersStore.deleteSeller(sellerToDelete.value.id);
        showToast('Vendedor excluído com sucesso', 'success');
      } catch (error) {
        showToast('Erro ao excluir vendedor', 'error');
      } finally {
        showDeleteModal.value = false;
        sellerToDelete.value = null;
      }
    };

    const sendReport = async (sellerId: number) => {
      try {
        const today = new Date().toISOString().split('T')[0];
        await sellersStore.sendReport(sellerId, today);
        showToast('Relatório enviado com sucesso', 'success');
      } catch (error) {
        showToast('Erro ao enviar relatório', 'error');
      }
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

    const formatCurrency = (value: number): string => {
      return value.toFixed(2).replace('.', ',');
    };

    onMounted(() => {
      fetchSellers();
    });

    return {
      sellers,
      loading,
      pagination,
      searchQuery,
      sortBy,
      showDeleteModal,
      sellerToDelete,
      toast,
      handleSearch,
      handleSort,
      changePage,
      confirmDelete,
      deleteSeller,
      sendReport,
      formatCurrency
    };
  }
});
</script>
