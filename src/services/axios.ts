import storage from "@/lib/storage";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const axiosConfig = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
});

axiosConfig.interceptors.request.use((config) => {
    const token = storage.get("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
},
  (error) => {
    return Promise.reject(error);
});

axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    const navigate = useNavigate();

    if (error.response?.status === 401) {
      storage.remove('accessToken');
      storage.remove('user');

      navigate("/login");
    }
    return Promise.reject(error);
  }
);

export default axiosConfig;