<template>
  <div class="p-4">
    <!-- En-tête -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Gestion des Transactions
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <button
          @click="openModal"
          class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          Nouvelle transaction
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mt-4 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label for="date_start" class="block text-sm font-medium text-gray-700">Date début</label>
          <input
            type="date"
            id="date_start"
            v-model="filters.date_start"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="date_end" class="block text-sm font-medium text-gray-700">Date fin</label>
          <input
            type="date"
            id="date_end"
            v-model="filters.date_end"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type"
            v-model="filters.type"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Tous</option>
            <option value="vente">Vente</option>
            <option value="achat">Achat</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste des transactions -->
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Date
                  </th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Produits
                  </th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Total
                  </th>
                  <th class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    {{ formatDate(transaction.created_at) }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      :class="{
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                        'bg-green-100 text-green-800': transaction.type === 'vente',
                        'bg-blue-100 text-blue-800': transaction.type === 'achat',
                      }"
                    >
                      {{ transaction.type === 'vente' ? 'Vente' : 'Achat' }}
                    </span>
                  </td>
                  <td class="px-3 py-4 text-sm text-gray-500">
                    <div class="space-y-1">
                      <div v-for="product in transaction.products" :key="product.id">
                        {{ product.name }} ({{ product.quantity }})
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ formatPrice(transaction.total) }}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      @click="viewTransaction(transaction)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de nouvelle transaction -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Nouvelle transaction
            </h3>
            <form @submit.prevent="handleSubmit" class="mt-4">
              <div class="space-y-4">
                <div>
                  <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    id="type"
                    v-model="form.type"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  >
                    <option value="vente">Vente</option>
                    <option value="achat">Achat</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Produits</label>
                  <div class="mt-2 space-y-4">
                    <div v-for="(item, index) in form.products" :key="index" class="flex space-x-4">
                      <select
                        v-model="item.product_id"
                        class="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      >
                        <option value="">Sélectionner un produit</option>
                        <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                          {{ product.name }} (Stock: {{ product.stock }})
                        </option>
                      </select>
                      <input
                        type="number"
                        v-model="item.quantity"
                        min="1"
                        class="w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                      <button
                        type="button"
                        @click="removeProduct(index)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="addProduct"
                    class="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                  >
                    Ajouter un produit
                  </button>
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                >
                  Créer
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

    <!-- Modal de détails -->
    <div v-if="showDetailsModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Détails de la transaction
            </h3>
            <div class="mt-4 space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Date</p>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedTransaction?.created_at) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Type</p>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedTransaction?.type === 'vente' ? 'Vente' : 'Achat' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Produits</p>
                <div class="mt-1 space-y-2">
                  <div v-for="product in selectedTransaction?.products" :key="product.id" class="flex justify-between">
                    <span class="text-sm text-gray-900">{{ product.name }}</span>
                    <span class="text-sm text-gray-500">{{ product.quantity }} × {{ formatPrice(product.prix) }}</span>
                  </div>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Total</p>
                <p class="mt-1 text-lg font-semibold text-gray-900">
                  {{ formatPrice(selectedTransaction?.total) }}
                </p>
              </div>
            </div>
            <div class="mt-5 sm:mt-6">
              <button
                type="button"
                @click="closeDetailsModal"
                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transactions'
import { useProductStore } from '@/stores/products'

const transactionStore = useTransactionStore()
const productStore = useProductStore()

const transactions = computed(() => transactionStore.transactions)
const availableProducts = computed(() => productStore.products)

const showModal = ref(false)
const showDetailsModal = ref(false)
const selectedTransaction = ref(null)

const form = ref({
  type: 'vente',
  products: [{ product_id: '', quantity: 1 }],
})

const filters = ref({
  date_start: '',
  date_end: '',
  type: '',
})

const openModal = () => {
  showModal.value = true
  form.value = {
    type: 'vente',
    products: [{ product_id: '', quantity: 1 }],
  }
}

const closeModal = () => {
  showModal.value = false
}

const addProduct = () => {
  form.value.products.push({ product_id: '', quantity: 1 })
}

const removeProduct = (index: number) => {
  form.value.products.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    await transactionStore.createTransaction(form.value)
    closeModal()
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error)
  }
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedTransaction.value = null
}

const filteredTransactions = computed(() => {
  let transactions = [...transactions.value]

  if (filters.value.date_start) {
    transactions = transactions.filter(t => new Date(t.created_at) >= new Date(filters.value.date_start))
  }

  if (filters.value.date_end) {
    transactions = transactions.filter(t => new Date(t.created_at) <= new Date(filters.value.date_end))
  }

  if (filters.value.type) {
    transactions = transactions.filter(t => t.type === filters.value.type)
  }

  return transactions
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

watch(filters.value, () => {
  transactionStore.fetchTransactions(filters.value)
})

onMounted(() => {
  productStore.fetchProducts()
  transactionStore.fetchTransactions()
})
</script> 