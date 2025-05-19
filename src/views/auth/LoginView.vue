<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <div class="flex justify-center mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Login</h1>
      </div>
      
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
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
        
        <div class="flex items-center justify-between">
          <button 
            type="submit" 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :disabled="loading"
          >
            <span v-if="loading">Entrando...</span>
            <span v-else>Entrar</span>
          </button>
          <router-link 
            to="/register" 
            class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Criar conta
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoginRequest } from '@/services/api/authService';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const loading = ref(false);
    const error = ref('');
    const form = reactive<LoginRequest>({
      email: '',
      password: ''
    });

    const handleSubmit = async () => {
      if (!form.email || !form.password) {
        error.value = 'Por favor, preencha todos os campos';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        await authStore.login(form);
        router.push('/');
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao fazer login';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      handleSubmit
    };
  }
});
</script>
