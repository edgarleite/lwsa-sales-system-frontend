<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Usuários</h1>
      <router-link 
        to="/admin/users/create" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Novo Usuário
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
      </div>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="users.length === 0" class="text-gray-500 text-center py-8">
        Nenhum usuário encontrado
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2 px-4 border-b text-left">Nome</th>
              <th class="py-2 px-4 border-b text-left">Email</th>
              <th class="py-2 px-4 border-b text-left">Data de Criação</th>
              <th class="py-2 px-4 border-b text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-100">
              <td class="py-2 px-4 border-b">{{ user.name }}</td>
              <td class="py-2 px-4 border-b">{{ user.email }}</td>
              <td class="py-2 px-4 border-b">{{ formatDate(user.created_at) }}</td>
              <td class="py-2 px-4 border-b text-center">
                <div class="flex justify-center space-x-2">
                  <router-link 
                    :to="`/admin/users/${user.id}/edit`" 
                    class="text-yellow-500 hover:text-yellow-700"
                    title="Editar"
                  >
                    <span class="material-icons text-sm">edit</span>
                  </router-link>
                  
                  <button 
                    @click="confirmDelete(user)" 
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
      <div v-if="users.length > 0" class="mt-4 flex justify-between items-center">
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
        <p class="mb-6">Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.name }}</strong>?</p>
        <div class="flex justify-end space-x-2">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button 
            @click="deleteUser" 
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
import { useUsersStore } from '@/stores/useUsersStore';
import { User } from '@/services/api/usersService';

export default defineComponent({
  name: 'UsersListView',
  setup() {
    const usersStore = useUsersStore();
    const searchQuery = ref('');
    const showDeleteModal = ref(false);
    const userToDelete = ref<User | null>(null);
    const toast = ref({
      show: false,
      message: '',
      type: 'success' as 'success' | 'error'
    });

    const loading = computed(() => usersStore.isLoading);
    const users = computed(() => usersStore.getUsers);
    const pagination = computed(() => usersStore.getPagination);

    const fetchUsers = async (page = 1) => {
      try {
        await usersStore.fetchUsers(page);
      } catch (error) {
        showToast('Erro ao carregar usuários', 'error');
      }
    };

    const handleSearch = () => {
      fetchUsers(1);
    };

    const changePage = (page: number) => {
      if (page < 1 || page > pagination.value.totalPages) return;
      fetchUsers(page);
    };

    const confirmDelete = (user: User) => {
      userToDelete.value = user;
      showDeleteModal.value = true;
    };

    const deleteUser = async () => {
      if (!userToDelete.value) return;
      
      try {
        await usersStore.deleteUser(userToDelete.value.id);
        showToast('Usuário excluído com sucesso', 'success');
      } catch (error) {
        showToast('Erro ao excluir usuário', 'error');
      } finally {
        showDeleteModal.value = false;
        userToDelete.value = null;
      }
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
      fetchUsers();
    });

    return {
      users,
      loading,
      pagination,
      searchQuery,
      showDeleteModal,
      userToDelete,
      toast,
      handleSearch,
      changePage,
      confirmDelete,
      deleteUser,
      formatDate
    };
  }
});
</script>
