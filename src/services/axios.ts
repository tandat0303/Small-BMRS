import storage from "@/lib/storage";
import axios from "axios";
import { navigateTo } from "./navigation";

const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosConfig.interceptors.request.use(
  (config) => {
    const token = storage.get("accessToken", "");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      navigateTo("/login");
    }
    return Promise.reject(error);
  },
);

export default axiosConfig;
