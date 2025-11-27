<template>
  <div class="min-h-full flex items-center justify-center ">
    <div class="max-w-md w-full space-y-8 bg-white rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Mot de passe"
            />
          </div>
        </div>

        <!-- Affichage des erreurs -->
        <div v-if="errors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Erreur de connexion
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <ul class="list-disc pl-5 space-y-1">
                  <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </button>
        </div>

        <div class="text-sm text-center">
          <router-link
            to="/register"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Pas encore de compte ? S'inscrire
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const form = ref({
  email: '',
  password: ''
})
const errors = ref<string[]>([])
const loading = ref(false)

const handleLogin = async () => {
  errors.value = []
  loading.value = true
  
  try {
    console.log('Tentative de connexion avec:', form.value)
    
    const response = await axios.post('http://localhost:8000/api/login', form.value)
    
    console.log('Réponse de connexion:', response.data)
    
    localStorage.setItem('token', response.data.access_token)
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Erreur de connexion:', error)
    
    if (error.response && error.response.status === 422) {
      // Erreur de validation
      if (error.response.data.errors) {
        Object.values(error.response.data.errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((errorMessage: string) => {
              errors.value.push(errorMessage)
            })
          }
        })
      } else {
        errors.value.push('Données de connexion invalides')
      }
    } else if (error.response && error.response.status === 401) {
      errors.value.push('Email ou mot de passe incorrect')
    } else {
      errors.value.push('Erreur de connexion. Veuillez réessayer.')
    }
  } finally {
    loading.value = false
  }
}
</script> 