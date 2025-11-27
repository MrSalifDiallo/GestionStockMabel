import { defineStore } from 'pinia'
import axiosClient from '@/axios'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      try {
        const response = await axiosClient.post('/login', credentials)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', response.data.token)
        return response
      } catch (error) {
        throw error
      }
    },

    async register(userData: { name: string; email: string; password: string; password_confirmation: string }) {
      try {
        const response = await axiosClient.post('/register', userData)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', response.data.token)
        return response
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await axiosClient.post('/logout', {}, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('token')
      }
    },

    async fetchUser() {
      try {
        const response = await axiosClient.get('/user', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        this.user = response.data
        return response
      } catch (error) {
        throw error
      }
    }
  }
}) 