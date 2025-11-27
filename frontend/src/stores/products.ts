import { defineStore } from 'pinia'
import axiosClient from '@/axios'
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  description: string
  prix_achat: number
  prix_vente: number
  stock: number
  image: string | null
  supplier_id: number
  supplier?: {
    id: number
    name: string
  }
}

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosClient.get('/products')
      products.value = response.data
    } catch (err) {
      error.value = 'Erreur lors du chargement des produits'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData: FormData) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosClient.post('/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      products.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création du produit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: number, productData: FormData) => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosClient.post(`/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la mise à jour du produit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await axiosClient.delete(`/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = 'Erreur lors de la suppression du produit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStockAlerts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axiosClient.get('/products/stock/alert')
      return response.data
    } catch (err) {
      error.value = 'Erreur lors du chargement des alertes de stock'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getStockAlerts,
  }
}) 