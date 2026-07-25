import { api } from "./axios";

export interface Ceremony {
  _id: string;
  name: string;
  normalized_name: string;
  popularity_score: number;
  is_user_added: boolean;
}

export async function getCeremonies(): Promise<Ceremony[]> {
  const { data } = await api.get<Ceremony[]>("/ceremonies/");
  return data;
}

export async function addCeremony(name: string): Promise<Ceremony> {
  const { data } = await api.post<Ceremony>("/ceremonies/", { name });
  return data;
}
