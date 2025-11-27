<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 space-y-2">
      <router-link
        to="/"
        class="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
        :class="{ 'bg-gray-700 text-white': $route.path === '/' }"
      >
        <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7m-10-10v10a1 1 0 01-1 1h-3"></path></svg>
        Tableau de bord
      </router-link>
      <router-link
        to="/products"
        class="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
        :class="{ 'bg-gray-700 text-white': $route.path === '/products' }"
      >
        <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 11h.01M7 15h.01M17 7h.01M17 11h.01M17 15h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
        Produits
      </router-link>
      <router-link
        to="/transactions"
        class="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
        :class="{ 'bg-gray-700 text-white': $route.path === '/transactions' }"
      >
        <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
        Transactions
      </router-link>
      <router-link
        v-if="isAdmin"
        to="/users"
        class="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
        :class="{ 'bg-gray-700 text-white': $route.path === '/users' }"
      >
        <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M10 14a2 2 0 01-2 2H6a2 2 0 01-2-2v-1a2 2 0 012-2h2a2 2 0 012 2v1zm4-1a2 2 0 012-2h2a2 2 0 012 2v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1z"></path></svg>
        Utilisateurs
      </router-link>
    </div>

    <div class="mt-auto pt-4 border-t border-gray-700">
      <div class="flex items-center px-4 mb-2">
        <div class="flex-shrink-0">
          <div class="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
            <span class="text-lg font-medium text-gray-300">
              {{ user?.name?.charAt(0) }}
            </span>
          </div>
        </div>
        <div class="ml-3">
          <div class="text-base font-medium text-white">{{ user?.name }}</div>
          <div class="text-sm font-medium text-gray-400">{{ user?.email }}</div>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="block w-full text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
      >
        Déconnexion
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script> 