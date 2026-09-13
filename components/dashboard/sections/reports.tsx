"use client"

import {
  BarChart3,
  DollarSign,
  Download,
  Handshake,
  PieChart as PieChartIcon,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReports } from "@/hooks/use-reports"
import { useQueryClient } from "@tanstack/react-query"

// ── Skeleton helpers ───────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 px-2 pb-4" style={{ height }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${25 + Math.random() * 65}%` }}
        />
      ))}
    </div>
  )
}

// ── Tooltip style ──────────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: "oklch(0.12 0.005 260)",
  border: "1px solid oklch(0.22 0.005 260)",
  borderRadius: "8px",
  color: "oklch(0.95 0 0)",
  fontSize: "12px",
}

// ── Main Component ─────────────────────────────────────────────────────────

export function ReportsSection() {
  const queryClient = useQueryClient()
  const { data, isLoading, isFetching } = useReports()

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["reports"] })
  }

  function handleExportCSV() {
    if (!data) return
    const rows: (string | number)[][] = [
      ["SalesOps Analytics Report", new Date().toLocaleDateString()],
      [],
      ["Summary KPIs"],
      ["Total Revenue ($)", data.summary.totalRevenue],
      ["Total Deals", data.summary.totalDeals],
      ["Win Rate (%)", data.summary.winRate],
      ["Avg Deal Size ($)", data.summary.avgDealSize],
      ["Active Deals", data.summary.openDeals],
      ["Open Pipeline Value ($)", data.summary.openPipelineValue],
      [],
      ["Pipeline by Stage"],
      ["Stage", "Deals", "Value ($)"],
      ...data.stageData.map((s) => [s.name, s.count, s.value]),
      [],
      ["Monthly Conversion Trend"],
      ["Month", "Won Deals", "Lost Deals", "Conversion Rate (%)"],
      ...data.conversionData.map((c) => [
        c.month,
        c.won,
        c.lost,
        c.rate != null ? `${c.rate}%` : "N/A",
      ]),
      [],
      ["Sales Rep Performance"],
      ["Rep", "Won Revenue ($)", "Open Pipeline ($)", "Deals"],
      ...data.repData.map((r) => [r.name, r.won, r.pipeline, r.deals]),
    ]
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.map((val) => `"${val}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `salesops-report-${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const summary = data?.summary
  const conversionData = data?.conversionData ?? []
  const stageData = data?.stageData ?? []
  const repData = data?.repData ?? []
  const winLossData = data?.winLossData ?? []

  const summaryCards = summary
    ? [
      {
        label: "Total Revenue",
        value:
          summary.totalRevenue >= 1_000_000
            ? `$${(summary.totalRevenue / 1_000_000).toFixed(2)}M`
            : `$${Math.round(summary.totalRevenue / 1000)}K`,
        sub: "Closed won deals",
        icon: DollarSign,
        up: true,
      },
      {
        label: "Win Rate",
        value: `${summary.winRate}%`,
        sub: `${data?.winLossData.find((d) => d.name === "Won")?.value ?? 0} won · ${data?.winLossData.find((d) => d.name === "Lost")?.value ?? 0} lost`,
        icon: Target,
        up: summary.winRate >= 50,
      },
      {
        label: "Avg Deal Size",
        value:
          summary.avgDealSize >= 1_000_000
            ? `$${(summary.avgDealSize / 1_000_000).toFixed(1)}M`
            : `$${Math.round(summary.avgDealSize / 1000)}K`,
        sub: "Closed won only",
        icon: Handshake,
        up: true,
      },
      {
        label: "Open Pipeline",
        value:
          summary.openPipelineValue >= 1_000_000
            ? `$${(summary.openPipelineValue / 1_000_000).toFixed(1)}M`
            : `$${Math.round(summary.openPipelineValue / 1000)}K`,
        sub: `${summary.openDeals} active deals`,
        icon: BarChart3,
        up: summary.openDeals > 0,
      },
    ]
    : null

  // Conversion trend label — compare first half vs second half
  const withData = conversionData.filter((d) => d.rate !== null)
  const firstHalf = withData.slice(0, Math.ceil(withData.length / 2))
  const secondHalf = withData.slice(Math.ceil(withData.length / 2))
  const avgFirst =
    firstHalf.length > 0
      ? firstHalf.reduce((a, d) => a + d.rate!, 0) / firstHalf.length
      : 0
  const avgSecond =
    secondHalf.length > 0
      ? secondHalf.reduce((a, d) => a + d.rate!, 0) / secondHalf.length
      : 0
  const convTrend =
    avgFirst > 0
      ? Math.round(((avgSecond - avgFirst) / avgFirst) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Reports & Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Live insights derived from your deals and pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isLoading || !data}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || !summaryCards
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : summaryCards.map((stat, i) => (
            <Card
              key={stat.label}
              className="border-border bg-card hover:border-muted-foreground/30 transition-all duration-300"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stat.sub}
                    </p>
                  </div>
                  <stat.icon
                    className={`w-8 h-8 opacity-40 ${stat.up ? "text-accent" : "text-destructive"}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate Trend */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">
                  Conversion Rate Trend
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Won ÷ (Won + Lost) per month
                </p>
              </div>
              {!isLoading && withData.length >= 2 && (
                <Badge
                  variant="outline"
                  className={
                    convTrend >= 0
                      ? "text-accent border-accent/30"
                      : "text-destructive border-destructive/30"
                  }
                >
                  {convTrend >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {convTrend >= 0 ? "+" : ""}
                  {convTrend}% trend
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton height={220} />
            ) : (
              <div className="h-55">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={conversionData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.22 0.005 260)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                      tickFormatter={(v) => `${v}%`}
                      dx={-10}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "oklch(0.95 0 0)", fontWeight: 600 }}
                      formatter={(value: any) => [
                        value != null ? `${value}%` : "No data",
                        "Conversion Rate",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="oklch(0.7 0.18 145)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "oklch(0.7 0.18 145)", strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Win / Loss Breakdown (Pie) */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Deal Outcome Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              All deals by status
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-6">
                <Skeleton className="w-44 h-44 rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-44 h-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winLossData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {winLossData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: any, name: any) => [
                          `${value} deals`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {winLossData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-foreground">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {item.value} deals
                        </p>
                        <p className="text-xs text-muted-foreground">
                          $
                          {item.amount >= 1_000_000
                            ? `${(item.amount / 1_000_000).toFixed(1)}M`
                            : `${Math.round(item.amount / 1000)}K`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Stage */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Revenue by Pipeline Stage
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Total deal value at each stage
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton height={220} />
            ) : (
              <div className="h-55">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stageData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
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
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `$${(v / 1_000_000).toFixed(1)}M`
                          : `$${Math.round(v / 1000)}K`
                      }
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, name: any, props: any) => [
                        typeof value === "number" && value >= 1_000_000
                          ? `$${(value / 1_000_000).toFixed(2)}M`
                          : typeof value === "number"
                            ? `$${value.toLocaleString()}`
                            : `${value}`,
                        props?.payload?.count != null
                          ? `${props.payload.count} deals`
                          : String(name),
                      ]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {stageData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Rep */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Revenue by Rep
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Won revenue vs open pipeline per rep
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton height={220} />
            ) : repData.length === 0 ? (
              <div className="h-55 flex items-center justify-center text-muted-foreground text-sm">
                No deal data yet
              </div>
            ) : (
              <div className="h-55">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={repData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    barGap={2}
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
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `$${(v / 1_000_000).toFixed(1)}M`
                          : `$${Math.round(v / 1000)}K`
                      }
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, name: any) => [
                        typeof value === "number" && value >= 1_000_000
                          ? `$${(value / 1_000_000).toFixed(2)}M`
                          : typeof value === "number"
                            ? `$${value.toLocaleString()}`
                            : `${value}`,
                        name,
                      ]}
                    />
                    <Bar
                      dataKey="won"
                      name="Won"
                      stackId="a"
                      fill="oklch(0.7 0.18 145)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="pipeline"
                      name="Pipeline"
                      stackId="a"
                      fill="oklch(0.7 0.18 220)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {!isLoading && repData.length > 0 && (
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.7 0.18 145)" }} />
                  Won
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.7 0.18 220)" }} />
                  Open Pipeline
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stage detail table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="pb-2 border-b border-border">
          <CardTitle className="text-base font-medium">
            Pipeline Stage Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center gap-8">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-2 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {stageData.map((stage) => {
                const maxValue = Math.max(...stageData.map((s) => s.value), 1)
                const pct = Math.round((stage.value / maxValue) * 100)
                return (
                  <div
                    key={stage.name}
                    className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-28">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {stage.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-8 flex-1 justify-end">
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {stage.count} deal{stage.count !== 1 ? "s" : ""}
                      </span>
                      <span className="text-sm font-semibold text-foreground w-20 text-right">
                        {stage.value >= 1_000_000
                          ? `$${(stage.value / 1_000_000).toFixed(1)}M`
                          : `$${Math.round(stage.value / 1000)}K`}
                      </span>
                      <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: stage.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
