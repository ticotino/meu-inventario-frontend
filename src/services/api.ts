import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken } from "./tokenStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const response = await axios.post<{ data: { accessToken: string } }>(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const token = response.data.data.accessToken;
  setAccessToken(token);
  return token;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const token = await refreshPromise;
        refreshPromise = null;
        originalRequest.headers.set("Authorization", `Bearer ${token}`);
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export interface Envelope<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: { message: string; details?: unknown };
}

export function getApiErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.error?.message) {
      // O backend detalha erros por item em details.itens (ex.: qual produto
      // não fecha e por quanto) — sem isso a mensagem genérica não é acionável.
      const itens = (data.error.details as { itens?: unknown } | undefined)?.itens;
      if (Array.isArray(itens) && itens.length > 0 && itens.every((item) => typeof item === "string")) {
        return `${data.error.message}: ${itens.join(" · ")}`;
      }
      return data.error.message;
    }
  }
  return fallback;
}
