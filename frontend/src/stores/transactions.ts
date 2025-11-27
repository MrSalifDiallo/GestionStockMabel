import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosClient from '@/axios'

interface TransactionProduct {
  id: number
  quantite: number
  prix_unitaire: number
  product: {
    id: number
    name: string
    prix_vente: number
  }
}

interface Transaction {
  id: number
  date: string
  total: number
  mode_paiement: string
  status: string
  user: {
    id: number
    name: string
  }
  products: TransactionProduct[]
}

interface TransactionStats {
  total_ventes: number
  nombre_transactions: number
  moyenne_par_transaction: number
  ventes_par_jour: {
    date: string
    total: number
  }[]
}

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const stats = ref<TransactionStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTransactions = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosClient.get('/transactions')
      transactions.value = response.data
    } catch (err) {
      error.value = 'Erreur lors du chargement des transactions'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const createTransaction = async (transactionData: {
    products: { id: number; quantite: number }[]
    mode_paiement: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosClient.post('/transactions', transactionData)
      transactions.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création de la transaction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTransaction = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosClient.get(`/transactions/${id}`)
      return response.data
    } catch (err) {
      error.value = 'Erreur lors du chargement de la transaction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosClient.get('/transactions/stats')
      stats.value = response.data
      return response.data
    } catch (err) {
      error.value = 'Erreur lors du chargement des statistiques'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    stats,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    getTransaction,
    fetchStats,
  }
}) 