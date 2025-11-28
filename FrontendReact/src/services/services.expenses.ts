import axiosInstance from "@/config/config.axios";

export interface Expense {
  id: number;
  category_id: number;
  expense_date: string;
  amount: string;
  description?: string;
  reference?: string;
  receipt?: string;
  created_by: number;
  category?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    name: string;
  };
}

export interface ExpenseCreateRequest {
  category_id: number;
  amount: number;
  expense_date: string;
  description?: string;
  reference?: string;
}

export interface ExpenseUpdateRequest {
  amount?: number;
  description?: string;
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

export const fetchExpenses = async (params?: {
  category?: number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}): Promise<PaginatedResponse<Expense>> => {
  const { data } = await axiosInstance.get("/expenses", { params });
  return data;
};

export const createExpense = async (expense: ExpenseCreateRequest): Promise<Expense> => {
  const { data } = await axiosInstance.post("/expenses", expense);
  return data;
};

export const updateExpense = async (
  id: number,
  expense: ExpenseUpdateRequest
): Promise<Expense> => {
  const { data } = await axiosInstance.put(`/expenses/${id}`, expense);
  return data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/expenses/${id}`);
};

