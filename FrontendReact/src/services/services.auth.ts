import axiosInstance from "@/config/config.axios";
import tokenProvider from "@/config/config.token-provider";
import { LoginParams, RegisterParams } from "@/types/types.auth";

export const login = async (params: LoginParams) => {
  const response = await axiosInstance.post("/auth/login", params);
  const { user, access_token, token_type } = response.data;
// Sauvegarde token correctement
tokenProvider.setToken({
    access_token,
    token_type,
  });    localStorage.setItem('user', JSON.stringify(user));
  return { user, access_token };
};


export const logout = async () => {
 try {
    await axiosInstance.post("/auth/logout");
  } catch (err) {
    console.warn("Logout error:", err);
  }

  await tokenProvider.clearToken();
  
  // Nettoyer tous les brouillons et données de session
  localStorage.removeItem('draft_sale');
  localStorage.removeItem('user');
  
  return true;
};

export const register = async (params: RegisterParams)=> {
  const response = await axiosInstance.post("/auth/register", params);
  const { user, access_token, token_type } = response.data;

  tokenProvider.setToken({
    access_token,
    token_type,
  });
    localStorage.setItem('user', JSON.stringify(user));
  return { user, access_token };
};