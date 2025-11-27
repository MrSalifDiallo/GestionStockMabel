<template>
  <!-- Statistiques -->
  <div>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Total des ventes
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ formatPrice(stats?.total_ventes || 0) }}
          </dd>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Nombre de transactions
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ stats?.nombre_transactions || 0 }}
          </dd>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">
            Moyenne par transaction
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ formatPrice(stats?.moyenne_par_transaction || 0) }}
          </dd>
        </div>
      </div>
    </div>
  </div>

  <!-- Graphique des ventes -->
  <div class="mt-8">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Ventes par jour</h2>
      <Line
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>

  <!-- Alertes de stock -->
  <div class="mt-8">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Alertes de stock</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in stockAlerts" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ product.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ product.stock }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-red-100 text-red-800': product.stock === 0,
                    'bg-yellow-100 text-yellow-800': product.stock > 0 && product.stock <= 5,
                  }"
                >
                  {{ product.stock === 0 ? 'Rupture' : 'Stock bas' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useAuthStore } from '@/stores/auth'
import { useTransactionStore } from '@/stores/transactions'
import { useProductStore } from '@/stores/products'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const productStore = useProductStore()

const user = computed(() => authStore.user)
const stats = computed(() => transactionStore.stats)
const stockAlerts = ref([])

const chartData = computed(() => {
  if (!stats.value?.ventes_par_jour) return null

  return {
    labels: stats.value.ventes_par_jour.map(v => v.date),
    datasets: [
      {
        label: 'Ventes',
        data: stats.value.ventes_par_jour.map(v => v.total),
        borderColor: '#4f46e5',
        tension: 0.1,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await Promise.all([
    transactionStore.fetchStats(),
    productStore.fetchStockAlerts()
  ])
})
</script> 