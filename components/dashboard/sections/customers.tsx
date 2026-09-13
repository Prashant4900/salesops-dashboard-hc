"use client"

import {
  Building2,
  Calendar,
  DollarSign,
  Edit2,
  ExternalLink,
  Filter,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import type { Customer, CreateCustomerInput } from "@/lib/clients/api"
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/use-customers"

const INDUSTRIES = [
  "Technology",
  "Manufacturing",
  "Healthcare",
  "Finance",
  "Retail",
  "Data Services",
  "Cloud Services",
  "Education",
  "Real Estate",
  "Energy",
  "Other",
]

const tierColors: Record<string, string> = {
  Enterprise: "bg-accent/20 text-accent border-accent/30",
  Growth: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  Starter: "bg-muted text-muted-foreground border-border",
}

function getHealthTrend(score: number): "up" | "down" | "stable" {
  if (score >= 75) return "up"
  if (score < 50) return "down"
  return "stable"
}

// ── Customer Form Dialog ────────────────────────────────────────────────────

type CustomerFormDialogProps = {
  open: boolean
  onClose: () => void
  customer?: Customer | null
}

function CustomerFormDialog({ open, onClose, customer }: CustomerFormDialogProps) {
  const isEditing = !!customer
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()

  const [form, setForm] = useState<CreateCustomerInput>({
    name: customer?.name ?? "",
    industry: customer?.industry ?? "",
    tier: customer
      ? (customer.tier.toUpperCase() as "ENTERPRISE" | "GROWTH" | "STARTER")
      : "STARTER",
    location: customer?.location ?? "",
    website: customer?.website ?? "",
    contact: customer?.contact ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    healthScore: customer?.healthScore ?? 50,
    notes: customer?.notes ?? "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Company name is required"
    if (!form.industry) e.industry = "Industry is required"
    if (!form.contact.trim()) e.contact = "Contact person is required"
    if (!form.email.trim()) e.email = "Email is required"
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email"
    if (
      form.healthScore !== undefined &&
      (form.healthScore < 0 || form.healthScore > 100)
    )
      e.healthScore = "Health score must be 0–100"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleChange(field: keyof CreateCustomerInput, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    try {
      if (isEditing && customer) {
        await updateMutation.mutateAsync({
          id: customer.id,
          input: form,
        })
      } else {
        await createMutation.mutateAsync(form)
      }
      onClose()
    } catch (_err) {
      // error handled by mutation
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Update the customer details below."
              : "Add a new customer to your CRM."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Company Name *</Label>
              <Input
                id="cust-name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Acme Corporation"
                className="w-full bg-secondary border-border"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-industry">Industry *</Label>
              <Select
                value={form.industry}
                onValueChange={(v) => handleChange("industry", v)}
              >
                <SelectTrigger id="cust-industry" className="w-full bg-secondary border-border">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-xs text-destructive">{errors.industry}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tier */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-tier">Tier</Label>
              <Select
                value={form.tier}
                onValueChange={(v) =>
                  handleChange("tier", v as "ENTERPRISE" | "GROWTH" | "STARTER")
                }
              >
                <SelectTrigger id="cust-tier" className="w-full bg-secondary border-border">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  <SelectItem value="GROWTH">Growth</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Health Score */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-health">Health Score (0–100)</Label>
              <Input
                id="cust-health"
                type="number"
                min={0}
                max={100}
                value={form.healthScore ?? 50}
                onChange={(e) =>
                  handleChange("healthScore", parseInt(e.target.value) || 0)
                }
                className="w-full bg-secondary border-border"
              />
              {errors.healthScore && (
                <p className="text-xs text-destructive">{errors.healthScore}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contact Person */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-contact">Contact Person *</Label>
              <Input
                id="cust-contact"
                value={form.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                placeholder="John Smith"
                className="w-full bg-secondary border-border"
              />
              {errors.contact && (
                <p className="text-xs text-destructive">{errors.contact}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-email">Email *</Label>
              <Input
                id="cust-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@acme.com"
                className="w-full bg-secondary border-border"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-phone">Phone</Label>
              <Input
                id="cust-phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full bg-secondary border-border"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-location">Location</Label>
              <Input
                id="cust-location"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full bg-secondary border-border"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-website">Website</Label>
            <Input
              id="cust-website"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://acme.com"
              className="w-full bg-secondary border-border"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-notes">Notes</Label>
            <Textarea
              id="cust-notes"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full bg-secondary border-border resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Confirmation Dialog ─────────────────────────────────────────────

type DeleteDialogProps = {
  open: boolean
  onClose: () => void
  customer: Customer | null
}

function DeleteCustomerDialog({ open, onClose, customer }: DeleteDialogProps) {
  const deleteMutation = useDeleteCustomer()

  async function handleDelete() {
    if (!customer) return
    await deleteMutation.mutateAsync(customer.id)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Delete Customer</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {customer?.name}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Loading Skeleton ───────────────────────────────────────────────────────

function CustomerCardSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export function CustomersSection() {
  const { data: customers = [], isLoading } = useCustomers()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = !selectedTier || customer.tier === selectedTier
    return matchesSearch && matchesTier
  })

  const totalRevenue = customers.reduce((acc, c) => acc + c.totalRevenue, 0)
  const avgHealthScore =
    customers.length > 0
      ? Math.round(
          customers.reduce((acc, c) => acc + c.healthScore, 0) /
            customers.length,
        )
      : 0
  const totalActiveDeals = customers.reduce((acc, c) => acc + c.activeDeals, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Customers",
            value: isLoading ? "—" : customers.length.toString(),
            icon: Building2,
            color: "text-foreground",
          },
          {
            label: "Total Revenue",
            value: isLoading
              ? "—"
              : totalRevenue >= 1_000_000
                ? `$${(totalRevenue / 1_000_000).toFixed(2)}M`
                : `$${(totalRevenue / 1000).toFixed(0)}K`,
            icon: DollarSign,
            color: "text-accent",
          },
          {
            label: "Avg Health Score",
            value: isLoading ? "—" : `${avgHealthScore}%`,
            icon: Star,
            color: "text-chart-3",
          },
          {
            label: "Active Deals",
            value: isLoading ? "—" : totalActiveDeals.toString(),
            icon: TrendingUp,
            color: "text-chart-1",
          },
        ].map((stat, index) => (
          <Card
            key={stat.label}
            className="border-border bg-card hover:border-muted-foreground/30 transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[280px] bg-secondary border-border focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {["Enterprise", "Growth", "Starter"].map((tier) => (
              <Button
                key={tier}
                variant={selectedTier === tier ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedTier(selectedTier === tier ? null : tier)
                }
                className={
                  selectedTier === tier
                    ? "bg-accent text-accent-foreground"
                    : ""
                }
              >
                {tier}
              </Button>
            ))}
          </div>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <CustomerCardSkeleton key={i} />
          ))
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm mt-1">
              {customers.length === 0
                ? "Add your first customer to get started."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer, index) => {
            const trend = getHealthTrend(customer.healthScore)
            return (
              <Card
                key={customer.id}
                className="border-border bg-card hover:border-accent/50 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 bg-secondary">
                        <AvatarFallback className="bg-secondary text-foreground font-semibold">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                          {customer.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {customer.industry}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${tierColors[customer.tier]} border`}>
                      {customer.tier}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      {customer.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{customer.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium text-foreground">
                          ${customer.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Active Deals
                        </span>
                        <span className="font-medium text-foreground">
                          {customer.activeDeals}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Last Contact
                        </span>
                        <span className="font-medium text-foreground">
                          {customer.lastContact}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Health Score
                      </span>
                      {trend === "up" && (
                        <TrendingUp className="w-3.5 h-3.5 text-accent" />
                      )}
                      {trend === "down" && (
                        <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${customer.healthScore}%`,
                            backgroundColor:
                              customer.healthScore >= 80
                                ? "oklch(0.7 0.18 145)"
                                : customer.healthScore >= 60
                                  ? "oklch(0.75 0.18 55)"
                                  : "oklch(0.65 0.2 25)",
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          customer.healthScore >= 80
                            ? "text-accent"
                            : customer.healthScore >= 60
                              ? "text-chart-3"
                              : "text-destructive"
                        }`}
                      >
                        {customer.healthScore}%
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() =>
                        window.open(`mailto:${customer.email}`, "_blank")
                      }
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5" />
                      Email
                    </Button>
                    {customer.website ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() =>
                          window.open(
                            customer.website!.startsWith("http")
                              ? customer.website!
                              : `https://${customer.website}`,
                            "_blank",
                          )
                        }
                      >
                        <Globe className="w-3.5 h-3.5 mr-1.5" />
                        Website
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        disabled
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        Schedule
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditCustomer(customer)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteCustomer(customer)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Dialogs */}
      <CustomerFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <CustomerFormDialog
        open={!!editCustomer}
        onClose={() => setEditCustomer(null)}
        customer={editCustomer}
      />
      <DeleteCustomerDialog
        open={!!deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        customer={deleteCustomer}
      />
    </div>
  )
}
