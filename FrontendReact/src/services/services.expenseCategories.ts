import axiosInstance from "@/config/config.axios";

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  type: "fixed" | "variable";
  icon?: string;
  active: boolean;
}

export const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const { data } = await axiosInstance.get("/expense-categories");
  return data;
};

