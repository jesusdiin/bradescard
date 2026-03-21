import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')

// ─── Persist & restore stores ─────────────────────────────────────────────────
import { useCreditFormStore } from './stores/creditFormStore'
import { useAuthStore } from './stores/authStore'

const formStore = useCreditFormStore()
const authStore = useAuthStore()

// Restore sessions
const savedForm = sessionStorage.getItem('creditForm')
if (savedForm) {
  try { formStore.$patch(JSON.parse(savedForm)) } catch { sessionStorage.removeItem('creditForm') }
}

// Restore auth (also re-applies CSS theme)
authStore.restoreSession()

// Watch and persist
watch(() => formStore.$state, state =>
  sessionStorage.setItem('creditForm', JSON.stringify(state)), { deep: true })

watch(() => authStore.$state, state =>
  sessionStorage.setItem('auth', JSON.stringify(state)), { deep: true })
