<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Editar Vendedor</h1>
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
    
    <div v-else class="bg-white p-6 rounded-lg shadow-md">
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nome</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Nome do vendedor"
            required
          />
        </div>
        
        <div class="mb-6">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="email@exemplo.com"
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
import { useRouter, useRoute } from 'vue-router';
import { useSellersStore } from '@/stores/useSellersStore';
import { SellerRequest } from '@/services/api/sellersService';

export default defineComponent({
  name: 'SellerEditView',
  setup() {
    const sellersStore = useSellersStore();
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const error = ref('');
    const form = reactive<SellerRequest>({
      name: '',
      email: ''
    });
    
    const toast = ref({
      show: false,
      message: '',
      type: 'success' as 'success' | 'error'
    });

    const sellerId = Number(route.params.id);

    const fetchSeller = async () => {
      loading.value = true;
      try {
        const response = await sellersStore.fetchSellerById(sellerId);
        const seller = sellersStore.getCurrentSeller;
        if (seller) {
          form.name = seller.name;
          form.email = seller.email;
        }
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao carregar dados do vendedor';
        showToast('Erro ao carregar dados do vendedor', 'error');
      } finally {
        loading.value = false;
      }
    };

    const handleSubmit = async () => {
      if (!form.name || !form.email) {
        error.value = 'Por favor, preencha todos os campos';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        await sellersStore.updateSeller(sellerId, form);
        showToast('Vendedor atualizado com sucesso', 'success');
        router.push('/sellers');
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao atualizar vendedor';
        showToast('Erro ao atualizar vendedor', 'error');
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
      fetchSeller();
    });

    return {
      form,
      loading,
      error,
      toast,
      handleSubmit
    };
  }
});
</script>
