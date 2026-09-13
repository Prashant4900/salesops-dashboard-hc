import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateDealInput, UpdateDealInput } from "@/lib/clients/api"
import { dealsApi } from "@/lib/clients/api"

export function useDeals() {
  return useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const data = await dealsApi.getAll()
      return data.deals
    },
  })
}

export function useRecentDeals() {
  return useQuery({
    queryKey: ["deals", "recent"],
    queryFn: async () => {
      const data = await dealsApi.getRecent()
      return data.deals
    },
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateDealInput) => dealsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["team", "performance"] })
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDealInput }) =>
      dealsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["team", "performance"] })
    },
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["team", "performance"] })
    },
  })
}

export function useMoveDealStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      stage,
    }: {
      id: string
      stage:
        | "LEAD"
        | "QUALIFIED"
        | "PROPOSAL"
        | "NEGOTIATION"
        | "CLOSED_WON"
        | "CLOSED_LOST"
    }) => dealsApi.update(id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["team", "performance"] })
    },
  })
}
