import { api } from "@/lib/api/axios";
import type { ChalisaStatusResponse, ChalisaCompleteResponse } from "@/types";

export async function fetchChalisaStatus() {
  const { data } = await api.get<ChalisaStatusResponse>("/hanuman-chalisa/status");
  return data;
}

export async function completeChalisaReading() {
  const { data } = await api.post<ChalisaCompleteResponse>("/hanuman-chalisa/complete");
  return data;
}
