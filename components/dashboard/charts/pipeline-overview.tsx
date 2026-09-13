"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeals } from "@/hooks/use-deals"

const STAGE_CONFIGS = [
  { id: "lead", name: "Lead", color: "bg-chart-1" },
  { id: "qualified", name: "Qualified", color: "bg-chart-2" },
  { id: "proposal", name: "Proposal", color: "bg-chart-3" },
  { id: "negotiation", name: "Negotiation", color: "bg-accent" },
]

export function PipelineOverview() {
  const { data: deals = [], isLoading } = useDeals()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <Card className="p-5 h-95 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 flex flex-col justify-between">
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24 mb-6" />
          <div className="space-y-5">
            {Array.from({ length: 4 }, (_, i) => `skel-${i}`).map((k) => (
              <div key={k} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="pt-5 border-t border-border flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
      </Card>
    )
  }

  // Active pipeline deals (exclude closed_lost)
  const activeDeals = deals.filter((d) => d.stage !== "closed_lost")
  const totalActiveValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
  const totalCount = activeDeals.length || 1

  const stageData = STAGE_CONFIGS.map((cfg) => {
    const stageDeals = deals.filter((d) => d.stage === cfg.id)
    const count = stageDeals.length
    const percentage = Math.round((count / totalCount) * 100)
    return {
      name: cfg.name,
      count,
      value: percentage,
      color: cfg.color,
    }
  })

  return (
    <Card className="p-5 h-95 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 flex flex-col justify-between">
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            Pipeline Stages
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Distribution by active stage
          </p>
        </div>

        <CardContent className="p-0">
          <div className="space-y-5">
            {stageData.map((stage, index) => (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stage.count} deal{stage.count !== 1 ? "s" : ""}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {stage.value}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: isLoaded ? `${stage.value}%` : "0%",
                      transitionDelay: `${index * 150}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      {/* Total pipeline value */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Active Pipeline Value
          </span>
          <span className="text-xl font-bold text-foreground">
            ${(totalActiveValue / 1000).toFixed(0)}k
          </span>
        </div>
      </div>
    </Card>
  )
}
