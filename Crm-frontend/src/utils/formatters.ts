// src/utils/formatters.ts
import { API_CONFIG } from '../config/api';

export const formatPrice = (price: number | null | undefined): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price || 0); // Default ke 0 jika price null atau undefined
};

export const BACKEND_URL = API_CONFIG.ROOT_URL;