import axiosInstance from "@/config/config.axios";
import { MetricsStats } from "@/types/types.metrics";

export const fetchDashboardData = async (): Promise<MetricsStats> => {
  const { data } = await axiosInstance.get("/dashboard");
  console.log("Dashboard data:", data);
  return data;
};
