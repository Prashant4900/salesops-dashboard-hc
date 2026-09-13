"use client"

import { formatDistanceToNow } from "date-fns"
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from "@/hooks/use-auth"
import {
  useCreateDeal,
  useDeals,
  useDeleteDeal,
  useUpdateDeal,
} from "@/hooks/use-deals"
import { useTeamMembers } from "@/hooks/use-team"
import type { CreateDealInput, Deal } from "@/lib/clients/api"
import { cn } from "@/lib/utils"

// ── Status config ────────────────────────────────────────────────────────────

const statusConfig = {
  won: { icon: CheckCircle2, label: "Won", variant: "success" as const },
  pending: { icon: Clock, label: "Pending", variant: "warning" as const },
  lost: { icon: XCircle, label: "Lost", variant: "destructive" as const },
}

// ── Create / Edit Dialog ─────────────────────────────────────────────────────

type DealFormData = {
  companyName: string
  value: string
  status: "WON" | "PENDING" | "LOST"
  stage:
    | "LEAD"
    | "QUALIFIED"
    | "PROPOSAL"
    | "NEGOTIATION"
    | "CLOSED_WON"
    | "CLOSED_LOST"
  assignedUserId: string
  closedAt: string
}

const EMPTY_FORM: DealFormData = {
  companyName: "",
  value: "",
  status: "PENDING",
  stage: "LEAD",
  assignedUserId: "",
  closedAt: "",
}

function DealDialog({
  open,
  onClose,
  deal,
}: {
  open: boolean
  onClose: () => void
  deal?: Deal
}) {
  const isEdit = !!deal
  const { data: members = [] } = useTeamMembers()
  const createMutation = useCreateDeal()
  const updateMutation = useUpdateDeal()

  const [form, setForm] = useState<DealFormData>(
    deal
      ? {
          companyName: deal.companyName,
          value: String(deal.value),
          status: deal.status.toUpperCase() as "WON" | "PENDING" | "LOST",
          stage: (deal.stage?.toUpperCase() || "LEAD") as DealFormData["stage"],
          assignedUserId: deal.userId,
          closedAt: deal.closedAt
            ? new Date(deal.closedAt).toISOString().split("T")[0]
            : "",
        }
      : EMPTY_FORM,
  )

  const isPending = createMutation.isPending || updateMutation.isPending

  function setField<K extends keyof DealFormData>(
    key: K,
    val: DealFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName.trim() || !form.value || !form.assignedUserId) {
      toast.error("Please fill in all required fields.")
      return
    }

    const payload: CreateDealInput = {
      companyName: form.companyName.trim(),
      value: Number(form.value),
      status: form.status,
      stage: form.stage,
      assignedUserId: form.assignedUserId,
      closedAt: form.closedAt || null,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: deal.id, input: payload })
        toast.success("Deal updated successfully.")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Deal created successfully.")
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "New Deal"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this deal."
              : "Add a new deal to track."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              placeholder="Acme Corp"
              value={form.companyName}
              onChange={(e) => setField("companyName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="value">Deal Value ($) *</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="100"
                placeholder="50000"
                value={form.value}
                onChange={(e) => setField("value", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setField("status", v as DealFormData["status"])
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="WON">Won</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stage">Pipeline Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(v) =>
                  setField("stage", v as DealFormData["stage"])
                }
              >
                <SelectTrigger id="stage" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="PROPOSAL">Proposal</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                  <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closedAt">Close Date</Label>
              <Input
                id="closedAt"
                type="date"
                value={form.closedAt}
                onChange={(e) => setField("closedAt", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assignedUserId">Assigned Rep *</Label>
            <Select
              value={form.assignedUserId}
              onValueChange={(v) => setField("assignedUserId", v)}
            >
              <SelectTrigger id="assignedUserId" className="w-full">
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDealDialog({
  deal,
  onClose,
}: {
  deal: Deal | null
  onClose: () => void
}) {
  const deleteMutation = useDeleteDeal()

  async function handleDelete() {
    if (!deal) return
    try {
      await deleteMutation.mutateAsync(deal.id)
      toast.success("Deal deleted.")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete deal.")
    }
  }

  return (
    <Dialog open={!!deal} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Deal</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deal?.companyName}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-2"
          >
            {deleteMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Deals Table Skeleton ──────────────────────────────────────────────────────

function DealsTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => `row-${i}`).map((key) => (
        <TableRow key={key}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-8 h-8 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ── Main Section ─────────────────────────────────────────────────────────────

type SortField = "companyName" | "value" | "updatedAt"

export function DealsSection() {
  const { data: deals = [], isLoading } = useDeals()
  const { data: currentUser } = useSession()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("updatedAt")
  const [sortAsc, setSortAsc] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editDeal, setEditDeal] = useState<Deal | null>(null)
  const [deleteDeal, setDeleteDeal] = useState<Deal | null>(null)

  const canMutate = currentUser?.role !== "STAFF"

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc((prev) => !prev)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const filtered = deals
    .filter((d) => {
      const matchSearch =
        d.companyName.toLowerCase().includes(search.toLowerCase()) ||
        d.rep.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || d.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortField === "companyName")
        cmp = a.companyName.localeCompare(b.companyName)
      else if (sortField === "value") cmp = a.value - b.value
      else
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return sortAsc ? cmp : -cmp
    })

  const totalValue = filtered.reduce((acc, d) => acc + d.value, 0)
  const wonDeals = filtered.filter((d) => d.status === "won")
  const winRate =
    filtered.length > 0
      ? Math.round((wonDeals.length / filtered.length) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Header + Add */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "—"
            : `${filtered.length} deal${filtered.length !== 1 ? "s" : ""} found`}
        </p>
        {canMutate && (
          <Button
            size="sm"
            type="button"
            className="gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </Button>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
          <span className="text-muted-foreground">Pipeline value:</span>
          <span className="font-semibold text-foreground">
            ${(totalValue / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
          <span className="text-muted-foreground">Win rate:</span>
          <span
            className={cn(
              "font-semibold",
              winRate >= 50 ? "text-success" : "text-foreground",
            )}
          >
            {winRate}%
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
          <span className="text-muted-foreground">Won:</span>
          <span className="font-semibold text-success">{wonDeals.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-60 pl-9 h-9 bg-secondary border-border focus-visible:border-accent"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "won", "pending", "lost"] as const).map((f) => (
              <Button
                key={f}
                variant={statusFilter === f ? "default" : "secondary"}
                size="sm"
                type="button"
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-3 h-8 text-xs font-medium capitalize",
                  statusFilter === f
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground h-auto p-0 hover:bg-transparent"
                    onClick={() => toggleSort("companyName")}
                  >
                    Company
                    <ArrowUpDown className="w-3 h-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground h-auto p-0 hover:bg-transparent"
                    onClick={() => toggleSort("value")}
                  >
                    Value
                    <ArrowUpDown className="w-3 h-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rep
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground h-auto p-0 hover:bg-transparent"
                    onClick={() => toggleSort("updatedAt")}
                  >
                    Last Updated
                    <ArrowUpDown className="w-3 h-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Close Date
                </TableHead>
                {canMutate && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <DealsTableSkeleton />
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="text-muted-foreground text-sm">
                      {search || statusFilter !== "all"
                        ? "No deals match your filters."
                        : 'No deals yet. Click "Add Deal" to get started.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((deal, index) => {
                  const cfg = statusConfig[deal.status]
                  const StatusIcon = cfg.icon

                  return (
                    <TableRow
                      key={deal.id}
                      className="hover:bg-secondary/30 transition-colors duration-150 cursor-default animate-in fade-in slide-in-from-left-2"
                      style={{
                        animationDelay: `${index * 40}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      {/* Company */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 rounded-md shrink-0">
                            <AvatarFallback className="bg-secondary text-muted-foreground text-xs font-semibold rounded-md">
                              {deal.companyName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">
                            {deal.companyName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Value */}
                      <TableCell className="py-3.5 px-4">
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          ${deal.value.toLocaleString()}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant={cfg.variant} className="gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </Badge>
                          {deal.stage && (
                            <Badge
                              variant="outline"
                              className="text-[10px] capitalize"
                            >
                              {deal.stage.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Rep */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[10px] bg-accent/20 text-accent-foreground">
                              {deal.repAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {deal.rep}
                          </span>
                        </div>
                      </TableCell>

                      {/* Last Updated */}
                      <TableCell className="py-3.5 px-4">
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(deal.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </TableCell>

                      {/* Close Date */}
                      <TableCell className="py-3.5 px-4">
                        <span className="text-sm text-muted-foreground">
                          {deal.closedAt
                            ? new Date(deal.closedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      {canMutate && (
                        <TableCell className="py-3.5 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => setEditDeal(deal)}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteDeal(deal)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer count */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-secondary/20 text-sm text-muted-foreground">
            Showing {filtered.length} of {deals.length} deals
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DealDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {editDeal && (
        <DealDialog
          open={!!editDeal}
          deal={editDeal}
          onClose={() => setEditDeal(null)}
        />
      )}
      <DeleteDealDialog deal={deleteDeal} onClose={() => setDeleteDeal(null)} />
    </div>
  )
}
