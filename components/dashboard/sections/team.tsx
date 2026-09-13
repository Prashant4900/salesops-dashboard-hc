"use client"

import {
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useTeamPerformance } from "@/hooks/use-team"
import { cn } from "@/lib/utils"

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  avatar: string
  deals: number
  revenue: number
  quota: number
  change: number
  rank: number
}

function roleBadgeVariant(role: string) {
  if (role === "OWNER") return "destructive"
  if (role === "ADMIN") return "warning"
  return "secondary"
}

function TeamMemberCardSkeleton() {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-10" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </Card>
  )
}

function TeamMemberCard({
  member,
  index,
}: {
  member: TeamMember
  index: number
}) {
  const quotaPercentage =
    member.quota > 0 ? (member.revenue / member.quota) * 100 : 0
  const isAboveQuota = quotaPercentage >= 100

  return (
    <Card
      className="group p-5 hover:border-accent/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-linear-to-br from-accent/80 to-chart-1 text-accent-foreground text-sm font-bold">
                {member.avatar}
              </AvatarFallback>
            </Avatar>
            {member.rank <= 3 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning flex items-center justify-center">
                <Trophy className="w-3 h-3 text-background" />
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              {member.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant={roleBadgeVariant(member.role)}
                className="text-[10px] px-1.5 py-0"
              >
                {member.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-35">
              {member.email}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="w-8 h-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => window.open(`mailto:${member.email}`)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                // Could wire to a remove mutation here
              }}
            >
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Revenue</p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            ${(member.revenue / 1000).toFixed(0)}k
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Deals Won</p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {member.deals}
          </p>
        </div>
      </div>

      {/* Quota progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Quota Attainment</span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              isAboveQuota ? "text-success" : "text-foreground",
            )}
          >
            {member.quota > 0
              ? `${quotaPercentage.toFixed(0)}%`
              : "No quota set"}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              isAboveQuota ? "bg-success" : "bg-accent",
            )}
            style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            type="button"
            title={`Email ${member.name}`}
            className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            onClick={() => window.open(`mailto:${member.email}`)}
          >
            <Mail className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            type="button"
            title="Rank"
            className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          >
            <Phone className="w-4 h-4" />
          </Button>
        </div>
        {member.change !== 0 ? (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              member.change >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {member.change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {member.change >= 0 ? "+" : ""}
            {member.change.toFixed(0)}%
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No trend data</span>
        )}
      </div>
    </Card>
  )
}

export function TeamSection() {
  const [chartLoaded, setChartLoaded] = useState(false)
  const {
    data: teamMembers = [],
    isLoading,
    refetch,
    isFetching,
  } = useTeamPerformance()

  useEffect(() => {
    const timer = setTimeout(() => setChartLoaded(true), 400)
    return () => clearTimeout(timer)
  }, [])

  const performanceData = teamMembers
    .slice(0, 8) // cap to 8 bars
    .map((m) => ({
      name: m.name ? m.name.split(" ")[0] : m.email.split("@")[0],
      revenue: Math.round(m.revenue / 1000),
      quota: Math.round(m.quota / 1000),
    }))

  const totalRevenue = teamMembers.reduce((acc, m) => acc + m.revenue, 0)
  const totalDeals = teamMembers.reduce((acc, m) => acc + m.deals, 0)
  const avgQuotaAttainment =
    teamMembers.length > 0
      ? teamMembers.reduce(
        (acc, m) => acc + (m.quota > 0 ? (m.revenue / m.quota) * 100 : 0),
        0,
      ) / teamMembers.length
      : 0

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="w-4 h-4" />
          <span>{isLoading ? "—" : `${teamMembers.length} members`}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Card className="p-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-7 w-24 mt-2" />
            </Card>
            <Card className="p-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-7 w-16 mt-2" />
            </Card>
            <Card className="p-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-7 w-20 mt-2" />
            </Card>
          </>
        ) : (
          <>
            <Card className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Team Revenue
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                ${(totalRevenue / 1000000).toFixed(2)}M
              </p>
            </Card>
            <Card className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-chart-1" />
                </div>
                <span className="text-sm text-muted-foreground">Deals Won</span>
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {totalDeals}
              </p>
            </Card>
            <Card className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Avg Quota Attainment
                </span>
              </div>
              <p
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  avgQuotaAttainment >= 100
                    ? "text-success"
                    : "text-foreground",
                )}
              >
                {avgQuotaAttainment.toFixed(0)}%
              </p>
            </Card>
          </>
        )}
      </div>

      {/* Performance chart */}
      <Card className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Revenue vs Quota
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Individual performance comparison
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Revenue (k)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">Quota (k)</span>
            </div>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-52 w-full rounded-lg" />
        ) : performanceData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
            No performance data yet.
          </div>
        ) : (
          <div
            className={`h-52 transition-opacity duration-700 ${chartLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.22 0.005 260)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                  tickFormatter={(value) => `$${value}k`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.12 0.005 260)",
                    border: "1px solid oklch(0.22 0.005 260)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "oklch(0.95 0 0)", fontWeight: 600 }}
                  itemStyle={{ color: "oklch(0.65 0 0)" }}
                  formatter={(value: number) => [`$${value}k`, ""]}
                />
                <Bar
                  dataKey="quota"
                  fill="oklch(0.65 0 0 / 0.2)"
                  radius={[4, 4, 0, 0]}
                  name="Quota"
                />
                <Bar
                  dataKey="revenue"
                  fill="oklch(0.7 0.18 220)"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Team members grid */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4">
          Team Members
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            ["sk-0", "sk-1", "sk-2"].map((key) => (
              <TeamMemberCardSkeleton key={key} />
            ))
          ) : teamMembers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-accent/5 rounded-lg border border-dashed border-border">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No team members found.</p>
              <p className="text-xs mt-1">
                Add members in Settings to get started.
              </p>
            </div>
          ) : (
            teamMembers.map((member, index) => (
              <TeamMemberCard key={member.id} member={member} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
