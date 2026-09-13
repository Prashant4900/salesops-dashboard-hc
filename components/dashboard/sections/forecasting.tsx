"use client"

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useForecasting } from "@/hooks/use-forecasting"
import { useQueryClient } from "@tanstack/react-query"

// ── Skeleton loaders ───────────────────────────────────────────────────────

function KpiSkeleton() {
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

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="flex items-end gap-2 px-4 pb-4"
      style={{ height }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export function ForecastingSection() {
  const queryClient = useQueryClient()
  const { data, isLoading, isFetching } = useForecasting()

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["forecasting"] })
  }

  const kpis = data?.kpis
  const forecastData = data?.forecastData ?? []
  const quarterlyForecast = data?.quarterlyForecast ?? []
  const scenarios = data?.scenarios ?? []
  const riskFactors = data?.riskFactors ?? []

  const kpiCards = kpis
    ? [
      {
        label: `${kpis.currentQuarterLabel} Forecast`,
        value:
          kpis.currentQuarterForecast >= 1_000_000
            ? `$${(kpis.currentQuarterForecast / 1_000_000).toFixed(1)}M`
            : `$${Math.round(kpis.currentQuarterForecast / 1000)}K`,
        subtext: `Target: ${kpis.currentQuarterTarget >= 1_000_000
            ? `$${(kpis.currentQuarterTarget / 1_000_000).toFixed(1)}M`
            : `$${Math.round(kpis.currentQuarterTarget / 1000)}K`
          }`,
        icon: Target,
        trend:
          kpis.currentQuarterForecast >= kpis.currentQuarterTarget
            ? `+${Math.round(((kpis.currentQuarterForecast - kpis.currentQuarterTarget) / kpis.currentQuarterTarget) * 100)}%`
            : `-${Math.round(((kpis.currentQuarterTarget - kpis.currentQuarterForecast) / kpis.currentQuarterTarget) * 100)}%`,
        trendUp: kpis.currentQuarterForecast >= kpis.currentQuarterTarget,
      },
      {
        label: "Forecast Accuracy",
        value: `${kpis.forecastAccuracy}%`,
        subtext: "Based on closed deals",
        icon: CheckCircle2,
        trend: `${kpis.forecastAccuracy >= 80 ? "+" : ""}${kpis.forecastAccuracy - 80}% vs baseline`,
        trendUp: kpis.forecastAccuracy >= 80,
      },
      {
        label: "Pipeline Coverage",
        value: `${kpis.pipelineCoverage}x`,
        subtext: "vs quota",
        icon: TrendingUp,
        trend: kpis.pipelineCoverage >= 2 ? "Healthy" : "Below target",
        trendUp: kpis.pipelineCoverage >= 2,
      },
      {
        label: "At-Risk Revenue",
        value:
          kpis.atRiskRevenue >= 1_000_000
            ? `$${(kpis.atRiskRevenue / 1_000_000).toFixed(1)}M`
            : `$${Math.round(kpis.atRiskRevenue / 1000)}K`,
        subtext: `${kpis.atRiskCount} deal${kpis.atRiskCount !== 1 ? "s" : ""} stalled`,
        icon: AlertTriangle,
        trend:
          kpis.atRiskCount === 0
            ? "No stalled deals"
            : `${kpis.atRiskCount} flagged`,
        trendUp: kpis.atRiskCount === 0,
      },
    ]
    : null

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Sales Forecasting
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Predictions derived from your live pipeline and closed deal history
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading || !kpiCards
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpiCards.map((stat, index) => (
            <Card
              key={stat.label}
              className="border-border bg-card transition-all duration-300 hover:border-muted-foreground/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stat.subtext}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <stat.icon
                      className={`w-5 h-5 ${stat.label === "At-Risk Revenue"
                          ? "text-chart-3"
                          : "text-accent"
                        }`}
                    />
                    <Badge
                      variant="outline"
                      className={`text-xs ${stat.trendUp
                          ? "text-accent border-accent/30"
                          : "text-destructive border-destructive/30"
                        }`}
                    >
                      {stat.trendUp ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stat.trend}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Main Forecast Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Revenue Forecast vs Actual
            </CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-chart-1" />
                <span className="text-muted-foreground">Forecast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-muted-foreground/50 border-dashed" />
                <span className="text-muted-foreground">Target</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartSkeleton height={300} />
          ) : (
            <div className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient
                      id="actualGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.7 0.18 145)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.7 0.18 145)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="forecastGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.7 0.18 220)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.7 0.18 220)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.22 0.005 260)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? `$${(v / 1_000_000).toFixed(1)}M`
                        : `$${Math.round(v / 1000)}K`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.12 0.005 260)",
                      border: "1px solid oklch(0.22 0.005 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                    formatter={(value: number, name: string) => [
                      value >= 1_000_000
                        ? `$${(value / 1_000_000).toFixed(2)}M`
                        : `$${value.toLocaleString()}`,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="oklch(0.55 0 0)"
                    strokeDasharray="5 5"
                    fill="none"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="oklch(0.7 0.18 220)"
                    fill="url(#forecastGradient)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="oklch(0.7 0.18 145)"
                    fill="url(#actualGradient)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "oklch(0.7 0.18 145)", strokeWidth: 0 }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Forecast Breakdown */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Quarterly Forecast Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton height={250} />
            ) : (
              <div className="h-62.5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyForecast} barGap={4}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.22 0.005 260)"
                    />
                    <XAxis
                      dataKey="quarter"
                      stroke="oklch(0.65 0 0)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="oklch(0.65 0 0)"
                      fontSize={12}
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `$${(v / 1_000_000).toFixed(1)}M`
                          : `$${Math.round(v / 1000)}K`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.12 0.005 260)",
                        border: "1px solid oklch(0.22 0.005 260)",
                        borderRadius: "8px",
                        color: "oklch(0.95 0 0)",
                      }}
                      formatter={(value: number, name: string) => [
                        value >= 1_000_000
                          ? `$${(value / 1_000_000).toFixed(2)}M`
                          : `$${value.toLocaleString()}`,
                        name,
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px" }}
                      formatter={(value) => (
                        <span style={{ color: "oklch(0.65 0 0)" }}>{value}</span>
                      )}
                    />
                    <Bar
                      dataKey="committed"
                      name="Committed"
                      fill="oklch(0.7 0.18 145)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="bestCase"
                      name="Best Case"
                      fill="oklch(0.7 0.18 220)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pipeline"
                      name="Pipeline"
                      fill="oklch(0.3 0.005 260)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scenario Analysis */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Scenario Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-2 h-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))
              : scenarios.map((scenario, index) => {
                const colors = [
                  "oklch(0.65 0.2 25)",   // Conservative — amber/orange
                  "oklch(0.7 0.18 145)",  // Base Case — accent green
                  "oklch(0.7 0.18 220)",  // Optimistic — blue
                ]
                const color = colors[index] ?? colors[1]
                return (
                  <div
                    key={scenario.name}
                    className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-muted-foreground/30 transition-all duration-300 animate-in fade-in slide-in-from-right-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-8 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {scenario.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {scenario.probability}% probability
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-semibold text-foreground">
                        {scenario.revenue >= 1_000_000
                          ? `$${(scenario.revenue / 1_000_000).toFixed(1)}M`
                          : `$${Math.round(scenario.revenue / 1000)}K`}
                      </p>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${scenario.probability}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Risk Factors</CardTitle>
            {!isLoading && (
              <Badge
                variant="outline"
                className="text-chart-3 border-chart-3/30"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {riskFactors.length} identified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-2 h-2 rounded-full mt-2" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-2 ml-5">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : riskFactors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-accent opacity-60" />
              <p className="font-medium text-foreground">No risk factors detected</p>
              <p className="text-sm mt-1">Your pipeline looks healthy!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {riskFactors.map((risk, index) => (
                <div
                  key={risk.id}
                  className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-chart-3/30 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${risk.severity === "high"
                            ? "bg-destructive"
                            : "bg-chart-3"
                          }`}
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {risk.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {risk.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        risk.severity === "high"
                          ? "bg-destructive/20 text-destructive border-destructive/30 shrink-0 ml-2"
                          : "bg-chart-3/20 text-chart-3 border-chart-3/30 shrink-0 ml-2"
                      }
                    >
                      {risk.impact}
                    </Badge>
                  </div>
                  {risk.deals.length > 0 && (
                    <div className="ml-5 flex items-center gap-2 flex-wrap">
                      {risk.deals.map((deal, dealIdx) => (
                        <Badge
                          key={`${deal}-${dealIdx}`}
                          variant="outline"
                          className="text-xs text-muted-foreground border-border"
                        >
                          {deal}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="ml-5 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                      onClick={() => {
                        // Navigate to deals section filtered by stalled
                        window.location.href = "/deals"
                      }}
                    >
                      View affected deals
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
