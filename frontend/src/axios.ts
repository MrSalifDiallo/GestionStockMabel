
import axios from "axios";

const axiosClient: any = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api"
});

export default axiosClient;
