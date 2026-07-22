import axios, { type AxiosError } from "axios";

import { API_BASE_URL } from "@/lib/constants";
import { getAuthSnapshot } from "@/store/useAuthStore";
import type { ApiErrorBody } from "@/types";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const { accessToken } = getAuthSnapshot();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Normalize FastAPI error shapes and force a redirect to /login on 401s
// (expired or invalid token) so a stale session never gets stuck retrying.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      getAuthSnapshot().clearSession();
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        window.location.href = `/login?next=${next}&reason=session_expired`;
      }
    }
    return Promise.reject(normalizeApiError(error));
  }
);

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function normalizeApiError(error: AxiosError<ApiErrorBody>): ApiError {
  const detail = error.response?.data?.detail;
  let message = error.message || "Something went wrong. Please try again.";

  if (typeof detail === "string") {
    message = detail;
  } else if (Array.isArray(detail) && detail.length > 0) {
    // FastAPI/Pydantic 422 validation error array
    message = detail.map((d) => d.msg).join(", ");
  }

  return new ApiError(message, error.response?.status);
}
