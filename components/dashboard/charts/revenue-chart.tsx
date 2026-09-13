"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useForecasting } from "@/hooks/use-forecasting"

export function RevenueChart() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { data: forecastData, isLoading } = useForecasting()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const data = forecastData?.forecastData.map((d) => ({
    month: d.month,
    revenue: d.actual != null && d.actual > 0 ? d.actual : d.forecast,
    target: d.target,
  })) ?? []

  return (
    <Card className="p-5 h-95 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Revenue Trend
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monthly performance vs target
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-2" />
            <span className="text-muted-foreground">Target</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-70 flex items-end gap-2 px-2 pb-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ height: `${30 + (i % 5) * 12}%` }}
            />
          ))}
        </div>
      ) : (
        <div
          className={`h-70 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.7 0.18 220)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.7 0.18 220)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.7 0.18 145)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.7 0.18 145)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `$${value / 1000}k`}
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
              formatter={(value: any) => [
                `$${(Number(value) / 1000).toFixed(0)}k`,
                "",
              ]}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="oklch(0.7 0.18 145)"
              strokeWidth={2}
              fill="url(#targetGradient)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="oklch(0.7 0.18 220)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </Card>
  )
}
