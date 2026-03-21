<template>
  <div class="login-card">
    <div class="login-header">
      <span class="login-icono">🏦</span>
      <h1>Solicitud de Crédito</h1>
      <p>Inicia sesión para continuar</p>
    </div>

    <div class="login-body">
      <form @submit.prevent="handleLogin">
        <div class="form-field">
          <label for="username">Usuario</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-control"
            :class="{ 'has-error': authStore.loginError }"
            placeholder="Ingresa tu usuario"
            autocomplete="username"
            @input="authStore.loginError = ''"
          />
        </div>

        <div class="form-field" style="margin-top: 1rem;">
          <label for="password">Contraseña</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'has-error': authStore.loginError }"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              @input="authStore.loginError = ''"
            />
            <button
              type="button"
              class="password-toggle"
              :title="showPassword ? 'Ocultar' : 'Mostrar'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <p v-if="authStore.loginError" class="login-error">
          ⚠️ {{ authStore.loginError }}
        </p>

        <button
          type="submit"
          class="btn btn-primary login-btn"
          :disabled="!username || !password"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

function handleLogin() {
  authStore.login(username.value, password.value)
}
</script>

<style scoped>
.login-card {
  width: min(420px, 100%);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.login-header {
  padding: 2.5rem 2rem 2rem;
  color: white;
  text-align: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover, #1e429f));
}

.login-icono {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.75rem;
  line-height: 1;
}

.login-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.login-header p {
  font-size: 0.875rem;
  opacity: 0.85;
  margin-top: 0.25rem;
}

.login-body {
  padding: 2rem;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-control {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  line-height: 1;
}

.login-error {
  font-size: 0.8rem;
  color: var(--color-error);
  margin-top: 0.75rem;
  padding: 0.6rem 0.875rem;
  background: var(--color-error-bg);
  border-radius: var(--radius-sm);
  border: 1px solid #fecaca;
}

.login-btn {
  width: 100%;
  margin-top: 1.5rem;
  justify-content: center;
  padding: 0.875rem;
  font-size: 1rem;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 480px) {
  .login-card { border-radius: 0; min-height: 100vh; }
}
</style>
