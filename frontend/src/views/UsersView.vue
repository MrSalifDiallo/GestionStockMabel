<template>
  <div class="w-full">
    <h1 class="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>
    
    <div class="bg-white shadow-md rounded-lg">
      <!-- Tableau des utilisateurs -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Les données des utilisateurs seront affichées ici -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// État local
const users = ref([])

// Fonction pour charger les utilisateurs
const loadUsers = async () => {
  try {
    // TODO: Implémenter l'appel API pour charger les utilisateurs
    // const response = await fetch('/api/users')
    // users.value = await response.json()
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  }
}

// Charger les utilisateurs au montage du composant
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style> 