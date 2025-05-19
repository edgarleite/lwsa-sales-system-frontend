<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Editar Usuário</h1>
      <router-link 
        to="/admin/users" 
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
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Nova Senha (deixe em branco para manter a atual)</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="********"
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
import { useUsersStore } from '@/stores/useUsersStore';
import { UserRequest } from '@/services/api/usersService';

export default defineComponent({
  name: 'UserEditView',
  setup() {
    const usersStore = useUsersStore();
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const error = ref('');
    const form = reactive<Partial<UserRequest>>({
      name: '',
      email: '',
      password: ''
    });
    
    const toast = ref({
      show: false,
      message: '',
      type: 'success' as 'success' | 'error'
    });

    const userId = Number(route.params.id);

    const fetchUser = async () => {
      loading.value = true;
      try {
        await usersStore.fetchUserById(userId);
        const user = usersStore.getCurrentUser;
        if (user) {
          form.name = user.name;
          form.email = user.email;
        }
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao carregar dados do usuário';
        showToast('Erro ao carregar dados do usuário', 'error');
      } finally {
        loading.value = false;
      }
    };

    const handleSubmit = async () => {
      if (!form.name || !form.email) {
        error.value = 'Por favor, preencha os campos obrigatórios';
        return;
      }

      loading.value = true;
      error.value = '';

      // Se a senha estiver vazia, não a envie na atualização
      const dataToUpdate = { ...form };
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }

      try {
        await usersStore.updateUser(userId, dataToUpdate);
        showToast('Usuário atualizado com sucesso', 'success');
        router.push('/admin/users');
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao atualizar usuário';
        showToast('Erro ao atualizar usuário', 'error');
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
      fetchUser();
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
