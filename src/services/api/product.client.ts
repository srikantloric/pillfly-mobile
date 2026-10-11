import axios from "axios";

import { API_CONFIG } from "@/config/api.config";
import { attachAuthInterceptors } from "@/features/auth/api/authInterceptors";

export const productClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.PRODUCT_BASE_PATH}`,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

attachAuthInterceptors(productClient);
