import { useQuery } from "@tanstack/react-query";
import { getMetricas } from "../services/dashboardService";

export function useDashboardMetricas() {
  return useQuery({
    queryKey: ["dashboard", "metricas"],
    queryFn: getMetricas,
  });
}
