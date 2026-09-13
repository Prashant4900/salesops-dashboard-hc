"use client"

import {
  ArrowRight,
  Building2,
  Clock,
  DollarSign,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { useSession } from "@/hooks/use-auth"
import {
  useCreateDeal,
  useDeals,
  useDeleteDeal,
  useMoveDealStage,
  useUpdateDeal,
} from "@/hooks/use-deals"
import { useTeamMembers } from "@/hooks/use-team"
import type { CreateDealInput, Deal, DealStage } from "@/lib/clients/api"
import { cn } from "@/lib/utils"

// ── Stage configuration ──────────────────────────────────────────────────────

type StageConfig = {
  id: DealStage
  name: string
  prob: number
  color: string
  bgLight: string
  borderColor: string
}

const STAGES: StageConfig[] = [
  {
    id: "lead",
    name: "Lead",
    prob: 20,
    color: "bg-chart-1",
    bgLight: "bg-chart-1/10",
    borderColor: "border-chart-1/30",
  },
  {
    id: "qualified",
    name: "Qualified",
    prob: 40,
    color: "bg-chart-2",
    bgLight: "bg-chart-2/10",
    borderColor: "border-chart-2/30",
  },
  {
    id: "proposal",
    name: "Proposal",
    prob: 60,
    color: "bg-chart-3",
    bgLight: "bg-chart-3/10",
    borderColor: "border-chart-3/30",
  },
  {
    id: "negotiation",
    name: "Negotiation",
    prob: 80,
    color: "bg-accent",
    bgLight: "bg-accent/10",
    borderColor: "border-accent/30",
  },
  {
    id: "closed_won",
    name: "Closed Won",
    prob: 100,
    color: "bg-success",
    bgLight: "bg-success/10",
    borderColor: "border-success/30",
  },
  {
    id: "closed_lost",
    name: "Closed Lost",
    prob: 0,
    color: "bg-destructive",
    bgLight: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
]

const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
}

// ── Deal Form Dialog (Create / Edit) ─────────────────────────────────────────

type DealFormData = {
  companyName: string
  value: string
  stage: DealStage
  probability: string
  assignedUserId: string
  closedAt: string
}

const EMPTY_FORM: DealFormData = {
  companyName: "",
  value: "",
  stage: "lead",
  probability: "20",
  assignedUserId: "",
  closedAt: "",
}

function PipelineDealDialog({
  open,
  onClose,
  deal,
  defaultStage = "lead",
}: {
  open: boolean
  onClose: () => void
  deal?: Deal | null
  defaultStage?: DealStage
}) {
  const isEdit = !!deal
  const { data: members = [] } = useTeamMembers()
  const createMutation = useCreateDeal()
  const updateMutation = useUpdateDeal()

  const [form, setForm] = useState<DealFormData>(() => {
    if (deal) {
      return {
        companyName: deal.companyName,
        value: String(deal.value),
        stage: deal.stage,
        probability: String(deal.probability),
        assignedUserId: deal.userId,
        closedAt: deal.closedAt
          ? new Date(deal.closedAt).toISOString().split("T")[0]
          : "",
      }
    }
    const defaultProb = STAGES.find((s) => s.id === defaultStage)?.prob ?? 20
    return {
      ...EMPTY_FORM,
      stage: defaultStage,
      probability: String(defaultProb),
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function setField<K extends keyof DealFormData>(
    key: K,
    val: DealFormData[K],
  ) {
    setForm((prev) => {
      const updated = { ...prev, [key]: val }
      // Auto-update probability when stage changes if creating
      if (key === "stage" && !isEdit) {
        const found = STAGES.find((s) => s.id === val)
        if (found) updated.probability = String(found.prob)
      }
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName.trim() || !form.value || !form.assignedUserId) {
      toast.error("Please fill in all required fields.")
      return
    }

    const stageEnum = form.stage.toUpperCase() as
      | "LEAD"
      | "QUALIFIED"
      | "PROPOSAL"
      | "NEGOTIATION"
      | "CLOSED_WON"
      | "CLOSED_LOST"

    const payload: CreateDealInput = {
      companyName: form.companyName.trim(),
      value: Number(form.value),
      stage: stageEnum,
      probability: Number(form.probability) || 20,
      assignedUserId: form.assignedUserId,
      closedAt: form.closedAt || null,
    }

    try {
      if (isEdit && deal) {
        await updateMutation.mutateAsync({ id: deal.id, input: payload })
        toast.success("Deal updated successfully.")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Deal added to pipeline.")
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
          <DialogTitle>
            {isEdit ? "Edit Deal" : "New Pipeline Deal"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update stage and deal attributes."
              : "Create a deal in your sales pipeline."}
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
              <Label htmlFor="stage">Stage *</Label>
              <Select
                value={form.stage}
                onValueChange={(v) => setField("stage", v as DealStage)}
              >
                <SelectTrigger id="stage" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={form.probability}
                onChange={(e) => setField("probability", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closedAt">Expected Close Date</Label>
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

// ── Deal Card ────────────────────────────────────────────────────────────────

function DealCard({
  deal,
  index,
  canMutate,
  onEdit,
  onDelete,
  onMoveStage,
}: {
  deal: Deal
  index: number
  canMutate: boolean
  onEdit: (deal: Deal) => void
  onDelete: (deal: Deal) => void
  onMoveStage: (deal: Deal, stage: DealStage) => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const otherStages = STAGES.filter((s) => s.id !== deal.stage)

  return (
    <Card
      className="group bg-card p-4 hover:border-accent/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 shadow-xs"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: "both" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top row: Company + Options menu */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground truncate">
            {deal.companyName}
          </span>
        </div>

        {canMutate && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className={cn(
                  "w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-150 shrink-0",
                  isHovered ? "opacity-100" : "opacity-0 sm:opacity-0",
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(deal)}>
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Edit Deal
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowRight className="w-3.5 h-3.5 mr-2" />
                  Move to Stage
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40">
                  {otherStages.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => onMoveStage(deal, s.id)}
                    >
                      <span
                        className={cn("w-2 h-2 rounded-full mr-2", s.color)}
                      />
                      {s.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(deal)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete Deal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Value */}
      <div className="flex items-center gap-1.5 text-base text-foreground font-bold mb-2.5">
        <DollarSign className="w-4 h-4 text-accent -mr-1" />
        {deal.value.toLocaleString()}
      </div>

      {/* Rep & Days */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1.5">
          <Avatar className="w-5 h-5">
            <AvatarFallback className="text-[9px] bg-accent/20 text-accent-foreground font-semibold">
              {deal.repAvatar}
            </AvatarFallback>
          </Avatar>
          <span className="truncate max-w-24">{deal.rep}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{deal.daysInStage}d in stage</span>
        </div>
      </div>

      {/* Probability Progress Bar */}
      <div className="pt-2.5 border-t border-border">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground text-[11px]">Probability</span>
          <span className="text-foreground font-medium text-[11px]">
            {deal.probability}%
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              deal.status === "won"
                ? "bg-success"
                : deal.status === "lost"
                  ? "bg-destructive"
                  : "bg-accent",
            )}
            style={{ width: `${deal.probability}%` }}
          />
        </div>
      </div>
    </Card>
  )
}

// ── Pipeline Skeleton ────────────────────────────────────────────────────────

function PipelineSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => `col-${i}`).map((colKey) => (
        <Card key={colKey} className="p-4 min-h-120 bg-card/60 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          {Array.from({ length: 2 }, (_, j) => `card-${j}`).map((cardKey) => (
            <Card key={cardKey} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="w-4 h-4 rounded" />
              </div>
              <Skeleton className="h-6 w-20" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded" />
            </Card>
          ))}
        </Card>
      ))}
    </div>
  )
}

// ── Main Section ─────────────────────────────────────────────────────────────

export function PipelineSection() {
  const { data: deals = [], isLoading } = useDeals()
  const { data: currentUser } = useSession()
  const moveMutation = useMoveDealStage()

  const [search, setSearch] = useState("")
  const [showClosed, setShowClosed] = useState(false)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [targetStage, setTargetStage] = useState<DealStage>("lead")
  const [editDeal, setEditDeal] = useState<Deal | null>(null)
  const [deleteDeal, setDeleteDeal] = useState<Deal | null>(null)

  const canMutate = currentUser?.role !== "STAFF"

  // Filter stages based on view mode (active 4 vs all 6)
  const visibleStages = useMemo(() => {
    return showClosed ? STAGES : STAGES.slice(0, 4)
  }, [showClosed])

  // Filter deals matching search query
  const filteredDeals = useMemo(() => {
    if (!search.trim()) return deals
    const q = search.toLowerCase()
    return deals.filter(
      (d) =>
        d.companyName.toLowerCase().includes(q) ||
        d.rep.toLowerCase().includes(q),
    )
  }, [deals, search])

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      closed_won: [],
      closed_lost: [],
    }

    for (const d of filteredDeals) {
      if (map[d.stage]) {
        map[d.stage].push(d)
      } else {
        // Fallback if deal stage is unset or legacy
        map.lead.push(d)
      }
    }
    return map
  }, [filteredDeals])

  // Calculate overall metrics
  const activeDeals = deals.filter(
    (d) => d.status === "pending" || d.stage !== "closed_lost",
  )
  const totalActiveValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
  const totalDealsCount = deals.length

  function openCreateForStage(stage: DealStage) {
    setTargetStage(stage)
    setCreateDialogOpen(true)
  }

  async function handleMoveStage(deal: Deal, newStage: DealStage) {
    const stageUpper = newStage.toUpperCase() as
      | "LEAD"
      | "QUALIFIED"
      | "PROPOSAL"
      | "NEGOTIATION"
      | "CLOSED_WON"
      | "CLOSED_LOST"

    try {
      await moveMutation.mutateAsync({ id: deal.id, stage: stageUpper })
      toast.success(`Moved "${deal.companyName}" to ${STAGE_LABELS[newStage]}.`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change stage.",
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Sales Pipeline
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize, progress, and forecast active deals through each stage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canMutate && (
            <Button
              variant="default"
              type="button"
              size="sm"
              onClick={() => openCreateForStage("lead")}
              className="gap-2 bg-accent text-accent-foreground font-medium hover:bg-accent/90 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Deal
            </Button>
          )}
        </div>
      </div>

      {/* Summary and Filters toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-xl bg-card border border-border">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search deals or reps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-secondary/70 border-border focus-visible:border-accent"
          />
        </div>

        {/* Stats & Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-xs">
            <span className="text-muted-foreground">Pipeline Value:</span>
            <span className="font-semibold text-foreground">
              ${(totalActiveValue / 1000).toFixed(0)}k
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-xs">
            <span className="text-muted-foreground">Total Deals:</span>
            <span className="font-semibold text-foreground">
              {totalDealsCount}
            </span>
          </div>

          {/* View toggle */}
          <Button
            variant={showClosed ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setShowClosed((prev) => !prev)}
            className={cn(
              "h-8 text-xs font-medium gap-1.5",
              showClosed
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {showClosed ? "Showing All 6 Stages" : "Active Stages Only"}
          </Button>
        </div>
      </div>

      {/* Pipeline Board */}
      {isLoading ? (
        <PipelineSkeleton />
      ) : (
        <div
          className={cn(
            "grid gap-4 items-start",
            showClosed
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {visibleStages.map((stage, stageIndex) => {
            const stageDeals = dealsByStage[stage.id] ?? []
            const stageTotal = stageDeals.reduce((acc, d) => acc + d.value, 0)

            return (
              <Card
                key={stage.id}
                className="p-3.5 min-h-125 bg-secondary/30 border-border/70 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{
                  animationDelay: `${stageIndex * 70}ms`,
                  animationFillMode: "both",
                }}
              >
                <div>
                  {/* Stage Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("w-2.5 h-2.5 rounded-full", stage.color)}
                      />
                      <h3 className="text-sm font-semibold text-foreground">
                        {stage.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[11px] font-semibold"
                      >
                        {stageDeals.length}
                      </Badge>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      ${(stageTotal / 1000).toFixed(0)}k
                    </span>
                  </div>

                  {/* Deals column */}
                  <div className="space-y-3 min-h-60">
                    {stageDeals.map((deal, dealIndex) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        index={dealIndex}
                        canMutate={canMutate}
                        onEdit={setEditDeal}
                        onDelete={setDeleteDeal}
                        onMoveStage={handleMoveStage}
                      />
                    ))}

                    {stageDeals.length === 0 && (
                      <div className="py-12 px-2 text-center rounded-lg border border-dashed border-border/80 bg-background/40">
                        <p className="text-xs text-muted-foreground">
                          No deals in {stage.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add deal to this stage button */}
                {canMutate && (
                  <Button
                    variant="outline"
                    type="button"
                    size="sm"
                    onClick={() => openCreateForStage(stage.id)}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-accent/50 hover:bg-secondary/70 transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add deal
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      {createDialogOpen && (
        <PipelineDealDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          defaultStage={targetStage}
        />
      )}

      {editDeal && (
        <PipelineDealDialog
          open={!!editDeal}
          deal={editDeal}
          onClose={() => setEditDeal(null)}
        />
      )}

      <DeleteDealDialog deal={deleteDeal} onClose={() => setDeleteDeal(null)} />
    </div>
  )
}
