<template>
  <div>
      <!-- En-tête -->
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gestion des Produits
          </h2>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            @click="openModal"
            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Ajouter un produit
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mt-4 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700">Recherche</label>
            <input
              type="text"
              id="search"
              v-model="search"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Nom du produit..."
            />
          </div>
          <div>
            <label for="sort" class="block text-sm font-medium text-gray-700">Trier par</label>
            <select
              id="sort"
              v-model="sort"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="name">Nom</option>
              <option value="stock">Stock</option>
              <option value="prix_vente">Prix de vente</option>
            </select>
          </div>
          <div>
            <label for="order" class="block text-sm font-medium text-gray-700">Ordre</label>
            <select
              id="order"
              v-model="order"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Liste des produits -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Produit
                    </th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stock
                    </th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Prix d'achat
                    </th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Prix de vente
                    </th>
                    <th class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="product in filteredProducts" :key="product.id">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                          <img
                            :src="product.image"
                            :alt="product.name"
                            class="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                        <div class="ml-4">
                          <div class="font-medium text-gray-900">{{ product.name }}</div>
                          <div class="text-gray-500">{{ product.description }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        :class="{
                          'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                          'bg-red-100 text-red-800': product.stock === 0,
                          'bg-yellow-100 text-yellow-800': product.stock > 0 && product.stock <= 5,
                          'bg-green-100 text-green-800': product.stock > 5,
                        }"
                      >
                        {{ product.stock }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatPrice(product.prix_achat) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatPrice(product.prix_vente) }}
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        @click="editProduct(product)"
                        class="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        @click="deleteProduct(product)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ editingProduct ? 'Modifier le produit' : 'Ajouter un produit' }}
            </h3>
            <form @submit.prevent="handleSubmit" class="mt-4">
              <div class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    id="name"
                    v-model="form.name"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    v-model="form.description"
                    rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  ></textarea>
                </div>

                <div>
                  <label for="prix_achat" class="block text-sm font-medium text-gray-700">Prix d'achat</label>
                  <input
                    type="number"
                    id="prix_achat"
                    v-model="form.prix_achat"
                    step="0.01"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label for="prix_vente" class="block text-sm font-medium text-gray-700">Prix de vente</label>
                  <input
                    type="number"
                    id="prix_vente"
                    v-model="form.prix_vente"
                    step="0.01"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label for="stock" class="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    id="stock"
                    v-model="form.stock"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label for="image" class="block text-sm font-medium text-gray-700">Image (URL)</label>
                  <input
                    type="text"
                    id="image"
                    v-model="form.image"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                >
                  {{ editingProduct ? 'Modifier' : 'Ajouter' }}
                </button>
                <button
                  type="button"
                  @click="closeModal"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useProductStore } from '@/stores/products'

const productStore = useProductStore()

const products = computed(() => productStore.products)
const search = ref('')
const sort = ref('name')
const order = ref('asc')

const showModal = ref(false)
const editingProduct = ref(null)
const form = ref({
  name: '',
  description: '',
  prix_achat: 0,
  prix_vente: 0,
  stock: 0,
  image: '',
})

const openModal = (product = null) => {
  showModal.value = true
  if (product) {
    editingProduct.value = product
    form.value = { ...product }
  } else {
    editingProduct.value = null
    form.value = {
      name: '',
      description: '',
      prix_achat: 0,
      prix_vente: 0,
      stock: 0,
      image: '',
    }
  }
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (editingProduct.value) {
    await productStore.updateProduct(editingProduct.value.id, form.value)
  } else {
    await productStore.addProduct(form.value)
  }
  closeModal()
}

const deleteProduct = async (product) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${product.name} ?`)) {
    await productStore.deleteProduct(product.id)
  }
}

const filteredProducts = computed(() => {
  let filtered = products.value.filter(product =>
    product.name.toLowerCase().includes(search.value.toLowerCase())
    )

  filtered.sort((a, b) => {
    const valA = a[sort.value]
    const valB = b[sort.value]

    if (sort.value === 'name') {
      return order.value === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    } else {
      return order.value === 'asc' ? valA - valB : valB - valA
    }
  })

  return filtered
})

watch([search, sort, order], () => {
  // Trigger re-render of filteredProducts
})

onMounted(() => {
  productStore.fetchProducts()
})

// Formatage des prix
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Édition d'un produit
const editProduct = (product) => {
  openModal(product)
}
</script> 