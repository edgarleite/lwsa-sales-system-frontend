<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Relatórios</h1>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">Enviar Relatórios Diários</h2>
      
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
      
      <div class="mb-4">
        <label for="report_date" class="block text-gray-700 text-sm font-bold mb-2">Data</label>
        <input 
          type="date" 
          id="report_date" 
          v-model="reportDate" 
          class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <button 
        @click="sendDailyReports" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        :disabled="loading"
      >
        <span v-if="loading">Enviando...</span>
        <span v-else>Enviar Relatórios para Todos os Vendedores</span>
      </button>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4">Reenviar Relatório para Vendedor Específico</h2>
      
      <div class="mb-4">
        <label for="seller_id" class="block text-gray-700 text-sm font-bold mb-2">Vendedor</label>
        <select 
          id="seller_id" 
          v-model="selectedSellerId" 
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="" disabled>Selecione um vendedor</option>
          <option v-for="seller in sellers" :key="seller.id" :value="seller.id">
            {{ seller.name }}
          </option>
        </select>
      </div>
      
      <div class="mb-4">
        <label for="resend_date" class="block text-gray-700 text-sm font-bold mb-2">Data</label>
        <input 
          type="date" 
          id="resend_date" 
          v-model="resendDate" 
          class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <button 
        @click="resendReport" 
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        :disabled="loading || !selectedSellerId"
      >
        <span v-if="loading">Enviando...</span>
        <span v-else>Reenviar Relatório</span>
      </button>
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
import { defineComponent, ref, onMounted } from 'vue';
import { useReportsStore } from '@/stores/useReportsStore';
import { useSellersStore } from '@/stores/useSellersStore';
import { Seller } from '@/services/api/sellersService';

export default defineComponent({
  name: 'AdminReportsView',
  setup() {
    const reportsStore = useReportsStore();
    const sellersStore = useSellersStore();
    const loading = ref(false);
    const error = ref('');
    const reportDate = ref(new Date().toISOString().split('T')[0]);
    const resendDate = ref(new Date().toISOString().split('T')[0]);
    const selectedSellerId = ref<number | null>(null);
    const sellers = ref<Seller[]>([]);
    
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
        showToast('Erro ao carregar vendedores', 'error');
      }
    };

    const sendDailyReports = async () => {
      if (!reportDate.value) {
        error.value = 'Por favor, selecione uma data';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        await reportsStore.sendDailyReports(reportDate.value);
        showToast('Relatórios enviados com sucesso', 'success');
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao enviar relatórios';
        showToast('Erro ao enviar relatórios', 'error');
      } finally {
        loading.value = false;
      }
    };

    const resendReport = async () => {
      if (!selectedSellerId.value || !resendDate.value) {
        error.value = 'Por favor, selecione um vendedor e uma data';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        await reportsStore.resendReport(selectedSellerId.value, resendDate.value);
        showToast('Relatório reenviado com sucesso', 'success');
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao reenviar relatório';
        showToast('Erro ao reenviar relatório', 'error');
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
      reportDate,
      resendDate,
      selectedSellerId,
      sellers,
      loading,
      error,
      toast,
      sendDailyReports,
      resendReport
    };
  }
});
</script>
