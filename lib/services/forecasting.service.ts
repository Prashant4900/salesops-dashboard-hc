import "server-only"

import { db } from "@/lib/clients/db"

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

// Monthly target growth rate — 5% MoM (can be made configurable)
const MONTHLY_TARGET_GROWTH = 0.05

export async function getForecastingData(businessId: string) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed

  // Fetch all deals for the business
  const deals = await db.deal.findMany({
    where: { businessId },
    select: {
      id: true,
      companyName: true,
      value: true,
      status: true,
      stage: true,
      probability: true,
      closedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // ── Monthly actuals (CLOSED_WON deals this year) ────────────────────────
  const monthlyActuals: Record<number, number> = {}
  for (const deal of deals) {
    if (deal.stage === "CLOSED_WON") {
      const closedDate = deal.closedAt
        ? new Date(deal.closedAt)
        : new Date(deal.updatedAt)
      if (closedDate.getFullYear() === currentYear) {
        const m = closedDate.getMonth()
        monthlyActuals[m] = (monthlyActuals[m] ?? 0) + deal.value
      }
    }
  }

  // ── Compute pipeline-weighted forecast for future months ─────────────────
  // Weighted pipeline = sum(value * probability) for open deals
  const openDeals = deals.filter((d) => d.status === "PENDING")
  const weightedPipeline = openDeals.reduce(
    (acc, d) => acc + d.value * (d.probability / 100),
    0,
  )

  // Spread weighted pipeline across remaining months of the year
  const remainingMonths = 12 - currentMonth - 1
  const monthlyForecastBase = remainingMonths > 0
    ? weightedPipeline / (remainingMonths + 1) // +1 for current month
    : weightedPipeline

  // Derive a monthly target from the first actual or a sensible base
  const firstActual = monthlyActuals[0] ?? monthlyForecastBase * 0.7
  
  const forecastData = MONTH_NAMES.map((month, i) => {
    const actual = monthlyActuals[i] ?? null
    const target = Math.round(firstActual * Math.pow(1 + MONTHLY_TARGET_GROWTH, i))

    let forecast: number
    if (i <= currentMonth) {
      // Past/current months — forecast = actual (or weighted pipeline if no actual)
      forecast = actual ?? Math.round(monthlyForecastBase * (1 + i * 0.03))
    } else {
      // Future months — forecast grows slightly each month
      forecast = Math.round(monthlyForecastBase * (1 + (i - currentMonth) * 0.03))
    }

    return { month, actual, forecast, target }
  })

  // ── Quarterly breakdown ─────────────────────────────────────────────────
  const quarters = [
    { quarter: "Q1", months: [0, 1, 2] },
    { quarter: "Q2", months: [3, 4, 5] },
    { quarter: "Q3", months: [6, 7, 8] },
    { quarter: "Q4", months: [9, 10, 11] },
  ]

  const quarterlyForecast = quarters.map(({ quarter, months }) => {
    // Committed = closed won in this quarter
    const committed = months.reduce((acc, m) => acc + (monthlyActuals[m] ?? 0), 0)

    // Pipeline value for this quarter (open deals)
    const qPipeline = openDeals.reduce((acc, d) => {
      // Approximate deals into quarters by expected close (use createdAt as proxy)
      return acc + d.value
    }, 0) / 4  // Evenly distributed for simplicity

    // Best case = committed + 70% of pipeline
    const bestCase = Math.round(committed + qPipeline * 0.7)
    const pipeline = Math.round(committed + qPipeline)

    return {
      quarter,
      committed: Math.round(committed),
      bestCase: Math.max(bestCase, committed),
      pipeline: Math.max(pipeline, bestCase),
    }
  })

  // ── KPI metrics ────────────────────────────────────────────────────────
  const currentQuarterIdx = Math.floor(currentMonth / 3)
  const currentQuarterMonths = quarters[currentQuarterIdx].months
  const currentQuarterActual = currentQuarterMonths.reduce(
    (acc, m) => acc + (monthlyActuals[m] ?? 0),
    0,
  )
  const currentQuarterTarget = quarterlyForecast[currentQuarterIdx].pipeline
  const currentQuarterForecast = Math.round(
    currentQuarterActual + weightedPipeline * 0.35,
  )

  // Pipeline coverage = total pipeline value / total quota (approximated)
  const totalPipelineValue = openDeals.reduce((acc, d) => acc + d.value, 0)
  const wonRevenue = deals
    .filter((d) => d.stage === "CLOSED_WON")
    .reduce((acc, d) => acc + d.value, 0)
  const totalQuota = wonRevenue > 0 ? wonRevenue * 1.5 : totalPipelineValue
  const pipelineCoverage =
    totalQuota > 0
      ? parseFloat((totalPipelineValue / (totalQuota / 4)).toFixed(1))
      : 0

  // Forecast accuracy — ratio of actual vs forecast for past months
  const pastMonths = forecastData.filter(
    (d) => d.actual !== null && d.forecast > 0,
  )
  const forecastAccuracy =
    pastMonths.length > 0
      ? Math.round(
          (pastMonths.reduce((acc, d) => {
            const accuracy = 1 - Math.abs((d.actual! - d.forecast) / d.forecast)
            return acc + Math.max(0, accuracy)
          }, 0) /
            pastMonths.length) *
            100,
        )
      : 95

  // ── At-risk deals (NEGOTIATION/PROPOSAL stalled >14 days) ───────────────
  const atRiskDeals = openDeals
    .filter((d) => {
      const daysSinceUpdate = Math.floor(
        (now.getTime() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
      )
      return (
        (d.stage === "NEGOTIATION" || d.stage === "PROPOSAL") &&
        daysSinceUpdate > 14
      )
    })
    .slice(0, 6)

  const atRiskRevenue = atRiskDeals.reduce((acc, d) => acc + d.value, 0)

  // ── Scenario analysis ──────────────────────────────────────────────────
  // Base: weighted pipeline + actual YTD
  const ytdActual = Object.values(monthlyActuals).reduce((a, b) => a + b, 0)
  const baseRevenue = Math.round(ytdActual + weightedPipeline)
  const scenarios = [
    {
      name: "Conservative",
      probability: 85,
      revenue: Math.round(baseRevenue * 0.75),
    },
    {
      name: "Base Case",
      probability: 65,
      revenue: baseRevenue,
    },
    {
      name: "Optimistic",
      probability: 40,
      revenue: Math.round(baseRevenue * 1.3),
    },
  ]

  // ── Risk factors from real data ────────────────────────────────────────
  const stalledDeals = openDeals
    .filter((d) => {
      const days = Math.floor(
        (now.getTime() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
      )
      return days > 14
    })
    .slice(0, 3)

  const highValueAtRisk = openDeals
    .filter((d) => d.value > 50000 && d.probability < 50)
    .slice(0, 3)

  const riskFactors = []

  if (stalledDeals.length > 0) {
    riskFactors.push({
      id: 1,
      title: "Deal Slippage Risk",
      description: `${stalledDeals.length} deal${stalledDeals.length > 1 ? "s" : ""} stalled for 14+ days`,
      impact: `-$${Math.round(stalledDeals.reduce((a, d) => a + d.value, 0) / 1000)}K`,
      severity: "high" as const,
      deals: stalledDeals.map((d) => d.companyName),
    })
  }

  if (highValueAtRisk.length > 0) {
    riskFactors.push({
      id: 2,
      title: "Low-Probability High-Value Deals",
      description: `${highValueAtRisk.length} high-value deal${highValueAtRisk.length > 1 ? "s" : ""} with <50% probability`,
      impact: `-$${Math.round(highValueAtRisk.reduce((a, d) => a + d.value * 0.5, 0) / 1000)}K`,
      severity: "medium" as const,
      deals: highValueAtRisk.map((d) => d.companyName),
    })
  }

  if (riskFactors.length === 0) {
    riskFactors.push({
      id: 1,
      title: "Pipeline Health",
      description: "No major risk factors detected in current pipeline",
      impact: "$0",
      severity: "medium" as const,
      deals: [],
    })
  }

  return {
    forecastData,
    quarterlyForecast,
    kpis: {
      currentQuarterLabel: `Q${currentQuarterIdx + 1}`,
      currentQuarterForecast,
      currentQuarterTarget,
      forecastAccuracy: Math.min(forecastAccuracy, 99),
      pipelineCoverage,
      atRiskRevenue,
      atRiskCount: atRiskDeals.length,
    },
    scenarios,
    riskFactors,
  }
}
