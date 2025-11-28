import axiosInstance from "@/config/config.axios";

export interface Product {
  id: number;
  name: string;
  code?: string;
  category_id: number;
  supplier_id?: number;
  prix_achat: number;
  prix_vente: number;
  stock: number;
  min_stock_alert: number;
  image?: string;
  image_url?: string;
  category?: {
    id: number;
    name: string;
  };
  supplier?: {
    id: number;
    name: string;
  };
}

export interface ProductCreateRequest {
  name: string;
  code?: string;
  category_id: number;
  supplier_id?: number;
  prix_achat: number;
  prix_vente: number;
  stock: number;
  min_stock_alert?: number;
}

export interface ProductUpdateRequest {
  name?: string;
  prix_achat?: number;
  prix_vente?: number;
  stock?: number;
  min_stock_alert?: number;
}

export const fetchProducts = async (params?: {
  category?: number;
  search?: string;
  stock_status?: string;
}): Promise<Product[]> => {
  const { data } = await axiosInstance.get("/products", { params });
  // Si c'est une pagination, retourner seulement les données
  if (data && data.data && Array.isArray(data.data)) {
    return data.data;
  }
  // Sinon retourner directement les données
  return Array.isArray(data) ? data : [];
};

export const fetchProduct = async (id: number): Promise<Product> => {
  const { data } = await axiosInstance.get(`/products/${id}`);
  return data;
};

export const createProduct = async (product: ProductCreateRequest, image?: File): Promise<Product> => {
  const formData = new FormData();
  Object.keys(product).forEach((key) => {
    const value = product[key as keyof ProductCreateRequest];
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });
  if (image) {
    formData.append('image', image);
  }
  
  const { data } = await axiosInstance.post("/products", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const updateProduct = async (id: number, product: ProductUpdateRequest): Promise<Product> => {
  const { data } = await axiosInstance.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/products/${id}`);
};

