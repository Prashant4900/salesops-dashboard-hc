import "server-only"

import { db } from "@/lib/clients/db"

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export async function getReportsData(businessId: string) {
  const now = new Date()
  const currentYear = now.getFullYear()

  // Fetch all deals + user info for the business
  const deals = await db.deal.findMany({
    where: { businessId },
    include: { user: { select: { name: true, email: true } } },
  })

  // ── Monthly conversion rate ──────────────────────────────────────────────
  // Conversion = closed_won / (closed_won + closed_lost) per month
  const wonByMonth: Record<number, number> = {}
  const lostByMonth: Record<number, number> = {}

  for (const deal of deals) {
    const closedDate = deal.closedAt
      ? new Date(deal.closedAt)
      : deal.stage === "CLOSED_WON" || deal.stage === "CLOSED_LOST"
        ? new Date(deal.updatedAt)
        : null
    if (!closedDate) continue
    if (closedDate.getFullYear() !== currentYear) continue
    const m = closedDate.getMonth()
    if (deal.stage === "CLOSED_WON") {
      wonByMonth[m] = (wonByMonth[m] ?? 0) + 1
    } else if (deal.stage === "CLOSED_LOST") {
      lostByMonth[m] = (lostByMonth[m] ?? 0) + 1
    }
  }

  const conversionData = MONTH_NAMES.map((month, i) => {
    const won = wonByMonth[i] ?? 0
    const lost = lostByMonth[i] ?? 0
    const total = won + lost
    const rate = total > 0 ? Math.round((won / total) * 100) : null
    return { month, rate, won, lost }
  })

  // Compute YoY-style label using avg of months that have data
  const monthsWithData = conversionData.filter((d) => d.rate !== null)
  const avgConvRate =
    monthsWithData.length > 0
      ? Math.round(
          monthsWithData.reduce((a, d) => a + d.rate!, 0) / monthsWithData.length,
        )
      : 0

  // ── Revenue by stage (pipeline breakdown) ───────────────────────────────
  const stageOrder = ["LEAD","QUALIFIED","PROPOSAL","NEGOTIATION","CLOSED_WON","CLOSED_LOST"]
  const stageLabels: Record<string, string> = {
    LEAD: "Lead",
    QUALIFIED: "Qualified",
    PROPOSAL: "Proposal",
    NEGOTIATION: "Negotiation",
    CLOSED_WON: "Won",
    CLOSED_LOST: "Lost",
  }
  const stageColors: Record<string, string> = {
    LEAD: "oklch(0.65 0 0)",
    QUALIFIED: "oklch(0.7 0.18 220)",
    PROPOSAL: "oklch(0.75 0.18 55)",
    NEGOTIATION: "oklch(0.65 0.2 25)",
    CLOSED_WON: "oklch(0.7 0.18 145)",
    CLOSED_LOST: "oklch(0.65 0.2 10)",
  }
  const stageRevenue: Record<string, number> = {}
  const stageCount: Record<string, number> = {}
  for (const deal of deals) {
    stageRevenue[deal.stage] = (stageRevenue[deal.stage] ?? 0) + deal.value
    stageCount[deal.stage] = (stageCount[deal.stage] ?? 0) + 1
  }
  const stageData = stageOrder.map((stage) => ({
    name: stageLabels[stage],
    value: Math.round(stageRevenue[stage] ?? 0),
    count: stageCount[stage] ?? 0,
    color: stageColors[stage],
  }))

  // ── Top reps by revenue ──────────────────────────────────────────────────
  const repRevenue: Record<string, { name: string; won: number; total: number; deals: number }> = {}
  for (const deal of deals) {
    const repName = deal.user.name ?? deal.user.email
    if (!repRevenue[deal.userId]) {
      repRevenue[deal.userId] = { name: repName, won: 0, total: 0, deals: 0 }
    }
    repRevenue[deal.userId].total += deal.value
    repRevenue[deal.userId].deals += 1
    if (deal.stage === "CLOSED_WON") {
      repRevenue[deal.userId].won += deal.value
    }
  }
  const repData = Object.values(repRevenue)
    .sort((a, b) => b.won - a.won)
    .slice(0, 6)
    .map((rep) => ({
      name: rep.name.split(" ")[0], // First name only for chart
      won: Math.round(rep.won),
      pipeline: Math.round(rep.total - rep.won),
      deals: rep.deals,
    }))

  // ── Win / Loss ratio ─────────────────────────────────────────────────────
  const wonDeals = deals.filter((d) => d.stage === "CLOSED_WON")
  const lostDeals = deals.filter((d) => d.stage === "CLOSED_LOST")
  const openDeals = deals.filter((d) => d.status === "PENDING")

  const totalWonValue = wonDeals.reduce((a, d) => a + d.value, 0)
  const totalLostValue = lostDeals.reduce((a, d) => a + d.value, 0)
  const totalOpenValue = openDeals.reduce((a, d) => a + d.value, 0)

  const winLossData = [
    { name: "Won", value: wonDeals.length, amount: Math.round(totalWonValue), color: "oklch(0.7 0.18 145)" },
    { name: "Lost", value: lostDeals.length, amount: Math.round(totalLostValue), color: "oklch(0.65 0.2 25)" },
    { name: "Open", value: openDeals.length, amount: Math.round(totalOpenValue), color: "oklch(0.7 0.18 220)" },
  ]

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalRevenue = wonDeals.reduce((a, d) => a + d.value, 0)
  const totalDeals = deals.length
  const winRate = wonDeals.length + lostDeals.length > 0
    ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
    : 0
  const avgDealSize = wonDeals.length > 0
    ? Math.round(totalRevenue / wonDeals.length)
    : 0

  return {
    conversionData,
    avgConvRate,
    stageData,
    repData,
    winLossData,
    summary: {
      totalRevenue: Math.round(totalRevenue),
      totalDeals,
      winRate,
      avgDealSize,
      openDeals: openDeals.length,
      openPipelineValue: Math.round(totalOpenValue),
    },
  }
}
