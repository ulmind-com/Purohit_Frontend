import { api } from "./axios";
import type { AstrologyMetadata } from "@/types";

export const getAstrologyMetadata = async (): Promise<AstrologyMetadata> => {
  const { data } = await api.get("/metadata/astrology");
  return data;
};
