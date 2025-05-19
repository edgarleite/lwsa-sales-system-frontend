<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Novo Usuário</h1>
      <router-link 
        to="/admin/users" 
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
          <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nome</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Nome do usuário"
            required
          />
        </div>
        
        <div class="mb-4">
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
        
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Senha</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="********"
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
import { defineComponent, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUsersStore } from '@/stores/useUsersStore';
import { UserRequest } from '@/services/api/usersService';

export default defineComponent({
  name: 'UserCreateView',
  setup() {
    const usersStore = useUsersStore();
    const router = useRouter();
    const loading = ref(false);
    const error = ref('');
    const form = reactive<UserRequest>({
      name: '',
      email: '',
      password: ''
    });
    
    const toast = ref({
      show: false,
      message: '',
      type: 'success' as 'success' | 'error'
    });

    const handleSubmit = async () => {
      if (!form.name || !form.email || !form.password) {
        error.value = 'Por favor, preencha todos os campos';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        await usersStore.createUser(form);
        showToast('Usuário criado com sucesso', 'success');
        router.push('/admin/users');
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao criar usuário';
        showToast('Erro ao criar usuário', 'error');
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
