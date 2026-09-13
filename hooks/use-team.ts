import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AddTeamMemberInput } from "@/lib/clients/api"
import { teamApi } from "@/lib/clients/api"

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team", "members"],
    queryFn: async () => {
      const data = await teamApi.getMembers()
      return data.members
    },
  })
}

export function useAddTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddTeamMemberInput) => teamApi.addMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", "members"] })
    },
  })
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      teamApi.updateMember(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", "members"] })
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teamApi.removeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", "members"] })
    },
  })
}
