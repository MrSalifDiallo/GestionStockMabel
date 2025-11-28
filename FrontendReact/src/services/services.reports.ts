import axiosInstance from "@/config/config.axios";

export interface ReportData {
  period: string;
  date_from: string;
  date_to: string;
  stats: {
    total_sales: number;
    total_benefits: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
  };
  sales_trend: Array<{
    date: string;
    ventes: number;
    benefices: number;
    depenses: number;
  }>;
  top_products_revenue: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  due_amounts: Array<{
    client: string;
    montant: number;
    jours: number;
    urgent: boolean;
  }>;
}

export const fetchReports = async (params?: {
  period?: "week" | "month" | "year" | "custom";
  date_from?: string;
  date_to?: string;
}): Promise<ReportData> => {
  const { data } = await axiosInstance.get("/reports", { params });
  return data;
};

