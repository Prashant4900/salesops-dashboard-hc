import { useQuery } from "@tanstack/react-query"
import { forecastingApi } from "@/lib/clients/api"

export function useForecasting() {
  return useQuery({
    queryKey: ["forecasting"],
    queryFn: () => forecastingApi.getData(),
    staleTime: 5 * 60 * 1000, // 5 minutes — forecast doesn't need real-time refresh
  })
}
