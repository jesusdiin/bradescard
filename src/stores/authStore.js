import { defineStore } from 'pinia'
import { empresas } from '@/data/empresas'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,       // { username }
    currentEmpresa: null,    // objeto completo de empresas.js (sin la lista de usuarios)
    isAuthenticated: false,
    loginError: '',
  }),

  actions: {
    login(username, password) {
      this.loginError = ''

      // Buscar el usuario en TODAS las empresas
      for (const empresa of empresas) {
        const usuario = empresa.usuarios.find(
          u => u.username === username.trim() && u.password === password
        )
        if (usuario) {
          // Guardar empresa sin exponer la lista de usuarios
          const { usuarios: _, ...empresaSafe } = empresa
          this.currentUser = { username: usuario.username }
          this.currentEmpresa = empresaSafe
          this.isAuthenticated = true
          this.applyTheme(empresa)
          return true
        }
      }

      this.loginError = 'Usuario o contraseña incorrectos.'
      return false
    },

    logout() {
      this.currentUser = null
      this.currentEmpresa = null
      this.isAuthenticated = false
      this.loginError = ''
      this.removeTheme()
      sessionStorage.removeItem('auth')
    },

    applyTheme(empresa) {
      const root = document.documentElement
      root.style.setProperty('--color-primary',       empresa.colores.primary)
      root.style.setProperty('--color-primary-hover', empresa.colores.primaryHover)
      root.style.setProperty('--color-primary-light', empresa.colores.primaryLight)
    },

    removeTheme() {
      const root = document.documentElement
      root.style.removeProperty('--color-primary')
      root.style.removeProperty('--color-primary-hover')
      root.style.removeProperty('--color-primary-light')
    },

    restoreSession() {
      const saved = sessionStorage.getItem('auth')
      if (!saved) return
      try {
        const parsed = JSON.parse(saved)
        if (parsed.isAuthenticated && parsed.currentEmpresa) {
          this.$patch(parsed)
          // Re-apply theme since CSS vars don't persist across reloads
          this.applyTheme(parsed.currentEmpresa)
        }
      } catch {
        sessionStorage.removeItem('auth')
      }
    },
  },
})
