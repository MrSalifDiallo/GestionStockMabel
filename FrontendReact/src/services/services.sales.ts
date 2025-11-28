import axiosInstance from "@/config/config.axios";

export interface Sale {
  id: number;
  invoice_number: string;
  client_id?: number;
  client_name?: string;
  sale_date: string;
  subtotal: string;
  discount_amount: string;
  total: string;
  amount_paid: string;
  amount_due: string;
  payment_status: "paid" | "partial" | "pending";
  notes?: string;
  client?: {
    id: number;
    name: string;
  };
  items?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    discount_percent: string;
    line_total: string;
    product?: {
      id: number;
      name: string;
    };
  }>;
}

export interface SaleCreateRequest {
  client_id?: number;
  client_name?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
  }>;
  amount_paid: number;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const fetchSales = async (params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}): Promise<PaginatedResponse<Sale>> => {
  const { data } = await axiosInstance.get("/sales", { params });
  return data;
};

export const fetchSale = async (id: number): Promise<Sale> => {
  const { data } = await axiosInstance.get(`/sales/${id}`);
  return data;
};

export const createSale = async (sale: SaleCreateRequest): Promise<Sale> => {
  const { data } = await axiosInstance.post("/sales", sale);
  return data;
};

export const deleteSale = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/sales/${id}`);
};

export const addPaymentToSale = async (saleId: number, amount: number): Promise<Sale> => {
  const response = await axiosInstance.put(`/sales/${saleId}/payment`, {
    amount_paid: amount,
  });
  return response.data;
};

