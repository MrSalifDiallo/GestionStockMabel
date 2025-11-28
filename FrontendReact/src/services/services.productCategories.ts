import axiosInstance from "@/config/config.axios";

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
}

export const fetchProductCategories = async (): Promise<ProductCategory[]> => {
  const { data } = await axiosInstance.get("/product-categories");
  return data;
};

