"use client"

import { DollarSign, Target, TrendingUp, Users } from "lucide-react"
import { PipelineOverview } from "@/components/dashboard/charts/pipeline-overview"
import { RevenueChart } from "@/components/dashboard/charts/revenue-chart"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RecentDeals } from "@/components/dashboard/recent-deals"
import { TopPerformers } from "@/components/dashboard/top-performers"
import { useDeals } from "@/hooks/use-deals"
import { useReports } from "@/hooks/use-reports"

export function OverviewSection() {
  const { data: reportsData, isLoading: isReportsLoading } = useReports()
  const { data: deals = [], isLoading: isDealsLoading } = useDeals()

  const summary = reportsData?.summary
  const leads = deals.filter((d) => d.stage === "lead")

  const totalRevValue = summary
    ? summary.totalRevenue >= 1_000_000
      ? `$${(summary.totalRevenue / 1_000_000).toFixed(2)}M`
      : `$${Math.round(summary.totalRevenue / 1000)}k`
    : isReportsLoading
      ? "..."
      : "$0"

  const winRateValue = summary
    ? `${summary.winRate}%`
    : isReportsLoading
      ? "..."
      : "0%"

  const activeDealsValue = summary
    ? `${summary.openDeals}`
    : isReportsLoading
      ? "..."
      : "0"

  const newLeadsValue = isDealsLoading ? "..." : `${leads.length}`

  const wonCount =
    reportsData?.winLossData.find((d) => d.name === "Won")?.value ?? 0
  const lostCount =
    reportsData?.winLossData.find((d) => d.name === "Lost")?.value ?? 0

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={totalRevValue}
          change={`${wonCount} won deals`}
          changeType="positive"
          icon={DollarSign}
          delay={0}
        />
        <MetricCard
          title="Conversion Rate"
          value={winRateValue}
          change={`${wonCount} won · ${lostCount} lost`}
          changeType={summary && summary.winRate >= 50 ? "positive" : "neutral"}
          icon={TrendingUp}
          delay={1}
        />
        <MetricCard
          title="Active Deals"
          value={activeDealsValue}
          change={
            summary?.openPipelineValue
              ? summary.openPipelineValue >= 1_000_000
                ? `$${(summary.openPipelineValue / 1_000_000).toFixed(1)}M pipeline`
                : `$${Math.round(summary.openPipelineValue / 1000)}k pipeline`
              : "0 in pipeline"
          }
          changeType="positive"
          icon={Target}
          delay={2}
        />
        <MetricCard
          title="New Leads"
          value={newLeadsValue}
          change={leads.length > 0 ? "Qualified next" : "Pipeline empty"}
          changeType={leads.length > 0 ? "positive" : "neutral"}
          icon={Users}
          delay={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <PipelineOverview />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDeals />
        <TopPerformers />
      </div>
    </div>
  )
}
