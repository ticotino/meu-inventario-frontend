import type { DashboardMetricas } from "../types/dashboard";
import { api } from "./api";
import type { Envelope } from "./api";

export async function getMetricas(): Promise<DashboardMetricas> {
  const { data } = await api.get<Envelope<DashboardMetricas>>("/dashboard/metricas");
  return data.data;
}
