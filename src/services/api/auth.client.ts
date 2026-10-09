import axios from 'axios';
import {API_CONFIG} from '@/config/api.config';



export const authClient = axios.create({ 
  baseURL:API_CONFIG.BASE_URL + API_CONFIG.AUTH_BASE_PATH,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});