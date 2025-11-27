<template>
  <div class="min-h-full bg-gray-100">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-gray-800 text-white flex-shrink-0 p-4 transform -translate-x-full md:translate-x-0 transition-transform duration-200 ease-in-out"
      :class="{ 'translate-x-0': sidebarOpen }"
    >
      <div class="text-xl font-bold mb-6">Gestion Stock</div>
      <Navigation />
    </aside>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar for "Gestion Stock" title and mobile menu button -->
      <header class="flex items-center justify-between p-4 bg-white shadow-md">
        <h1 class="text-xl font-semibold">Gestion Stock</h1>
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              v-if="!sidebarOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navigation from '@/components/Navigation.vue'

const sidebarOpen = ref(false)
</script>

<style scoped>
/* Des styles additionnels si besoin, mais Tailwind devrait suffire */
</style> 