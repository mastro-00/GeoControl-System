import axios, { AxiosInstance } from "axios";
import { getServerUrl } from "@config";
import qs from "qs";
import router from "@router/index";
import { logout } from "@services/auth";

let axiosInstance: AxiosInstance | null = null;

export function initApi() {
  axiosInstance = axios.create({
    baseURL: getServerUrl(),
    headers: {
      "Content-Type": "application/json"
    },
    paramsSerializer: (params) => qs.stringify(params, { encode: true })
  });

  axiosInstance.interceptors.request.use((config: any) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
        router.push("/login");
      }
      return Promise.reject(error);
    }
  );
}

export default function getApi(): AxiosInstance {
  if (!axiosInstance) {
    throw new Error("Axios instance not initialized. Call initApi() first.");
  }
  return axiosInstance;
}
