import axios from "axios";
import tokenProvider from "./config.token-provider";
import { SERVER } from "./config.server";
// Création de l'instance Axios
const axiosInstance = axios.create({
  baseURL: SERVER.URL,
  timeout: 10000,
  headers: {
    "content-type": "application/json",
  },
});

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  async (request) => {
    try {
      const tokens = tokenProvider.getToken();
      if (tokens) {
        request.headers.Authorization = `Bearer ${tokens}`;
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
    return request;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si erreur 401 (non autorisé) et pas déjà retenté
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Vérifier si le token existe
      const token = tokenProvider.getToken();
      
      if (!token) {
        // Pas de token, rediriger vers login
        tokenProvider.clearToken();
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Token expiré ou invalide
      tokenProvider.clearToken();
      
      // Éviter les redirections multiples
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }

    // Autres erreurs
    return Promise.reject(error);
  }
);


export default axiosInstance;
