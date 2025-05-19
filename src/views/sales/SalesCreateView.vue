<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Nova Venda</h1>
      <router-link 
        to="/sales" 
        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        Voltar
      </router-link>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="seller_id" class="block text-gray-700 text-sm font-bold mb-2">Vendedor</label>
          <select 
            id="seller_id" 
            v-model="form.seller_id" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="" disabled>Selecione um vendedor</option>
            <option v-for="seller in sellers" :key="seller.id" :value="seller.id">
              {{ seller.name }}
            </option>
          </select>
        </div>
        
        <div class="mb-4">
          <label for="amount" class="block text-gray-700 text-sm font-bold mb-2">Valor</label>
          <input 
            type="number" 
            id="amount" 
            v-model="form.amount" 
            step="0.01"
            min="0.01"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="0.00"
            required
          />
        </div>
        
        <div class="mb-6">
          <label for="sale_date" class="block text-gray-700 text-sm font-bold mb-2">Data da Venda</label>
          <input 
            type="date" 
            id="sale_date" 
            v-model="form.sale_date" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div class="flex items-center justify-end">
          <button 
            type="submit" 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :disabled="loading"
          >
            <span v-if="loading">Salvando...</span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </form>
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
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSalesStore } from '@/stores/useSalesStore';
import { useSellersStore } from '@/stores/useSellersStore';
import { SaleRequest } from '@/services/api/salesService';
import { Seller } from '@/services/api/sellersService';

export default defineComponent({
  name: 'SalesCreateView',
  setup() {
    const salesStore = useSalesStore();
    const sellersStore = useSellersStore();
    const router = useRouter();
    const loading = ref(false);
    const error = ref('');
    const sellers = ref<Seller[]>([]);
    const form = reactive<SaleRequest>({
      seller_id: 0,
      amount: 0,
      sale_date: new Date().toISOString().split('T')[0]
    });
    
    const toast = ref({
      show: false,
      message: '',
      type: 'success' as 'success' | 'error'
    });

    const fetchSellers = async () => {
      try {
        await sellersStore.fetchSellers();
        sellers.value = sellersStore.getSellers;
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao carregar vendedores';
      }
    };

    const handleSubmit = async () => {
      if (!form.seller_id || form.amount <= 0 || !form.sale_date) {
        error.value = 'Por favor, preencha todos os campos corretamente';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        await salesStore.createSale(form);
        showToast('Venda criada com sucesso', 'success');
        router.push('/sales');
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao criar venda';
        showToast('Erro ao criar venda', 'error');
      } finally {
        loading.value = false;
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

    onMounted(() => {
      fetchSellers();
    });

    return {
      form,
      sellers,
      loading,
      error,
      toast,
      handleSubmit
    };
  }
});
</script>
