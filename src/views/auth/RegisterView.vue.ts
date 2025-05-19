import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const authStore = useAuthStore();
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);
    const error = ref('');

    const handleRegister = async () => {
      if (!name.value || !email.value || !password.value) {
        error.value = 'Por favor, preencha todos os campos';
        return;
      }

      if (password.value !== confirmPassword.value) {
        error.value = 'As senhas não coincidem';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        await authStore.register({
          name: name.value,
          email: email.value,
          password: password.value
        });
        // Redirecionar para o dashboard é feito pelo router guard
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao registrar. Verifique os dados informados.';
      } finally {
        loading.value = false;
      }
    };

    return {
      name,
      email,
      password,
      confirmPassword,
      loading,
      error,
      handleRegister
    };
  }
});
