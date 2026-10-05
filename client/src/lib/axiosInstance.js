import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.token = token;
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // localStorage may be inaccessible
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
      console.error("Network error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
