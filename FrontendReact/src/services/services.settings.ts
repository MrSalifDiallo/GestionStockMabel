import axiosInstance from "@/config/config.axios";

export interface DiscountSettings {
  auto_discount_enabled: boolean;
  discount_tier_1_qty: number;
  discount_tier_1_percent: number;
  discount_tier_2_qty: number;
  discount_tier_2_percent: number;
}

export const fetchDiscountSettings = async (): Promise<DiscountSettings> => {
  const response = await axiosInstance.get("/settings/discount");
  return response.data;
};

export const updateDiscountSettings = async (
  settings: DiscountSettings
): Promise<{ message: string; settings: DiscountSettings }> => {
  const response = await axiosInstance.put("/settings/discount", settings);
  return response.data;
};

export const fetchAllSettings = async (): Promise<Record<string, any>> => {
  const response = await axiosInstance.get("/settings");
  return response.data;
};

export const updateSettings = async (
  settings: Array<{ key: string; value: any; type?: string }>
): Promise<{ message: string; settings: Record<string, any> }> => {
  const response = await axiosInstance.put("/settings", { settings });
  return response.data;
};
