import { useQuery } from "@tanstack/react-query"
import { reportsApi } from "@/lib/clients/api"

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsApi.getData(),
    staleTime: 5 * 60 * 1000,
  })
}
