import axiosInstance from "@/config/config.axios";

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  measurements?: string;
  active?: boolean;
  total_orders?: number;
  total_paid?: number;
  total_due?: number;
  last_purchase?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientCreateRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  measurements?: string;
  active?: boolean;
}

export interface ClientUpdateRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  measurements?: string;
  active?: boolean;
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

export const fetchClients = async (params?: {
  search?: string;
  with_due?: boolean;
  per_page?: number;
  page?: number;
}): Promise<PaginatedResponse<Client>> => {
  const { data } = await axiosInstance.get("/clients", { params });
  return data;
};

export const fetchClient = async (id: number): Promise<Client> => {
  const { data } = await axiosInstance.get(`/clients/${id}`);
  return data;
};

export const createClient = async (client: ClientCreateRequest): Promise<Client> => {
  const { data } = await axiosInstance.post("/clients", client);
  return data;
};

export const updateClient = async (id: number, client: ClientUpdateRequest): Promise<Client> => {
  const { data } = await axiosInstance.put(`/clients/${id}`, client);
  return data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/clients/${id}`);
};

