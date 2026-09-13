"use client"

import { TrendingDown, TrendingUp, Trophy } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTeamPerformance } from "@/hooks/use-team"

export function TopPerformers() {
  const { data: members = [], isLoading } = useTeamPerformance()
  const topMembers = [...members].sort((a, b) => a.rank - b.rank).slice(0, 5)

  if (isLoading) {
    return (
      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mb-3">
          <div>
            <CardTitle className="text-base">Top Performers</CardTitle>
            <CardDescription className="mt-0.5">
              This month&apos;s leaders
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-warning">
            <Trophy className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
            <div key={key} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-3 w-10 ml-auto" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mb-3">
        <div>
          <CardTitle className="text-base">Top Performers</CardTitle>
          <CardDescription className="mt-0.5">
            This month&apos;s leaders
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 text-warning">
          <Trophy className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {topMembers.map((person, index) => {
          const isPositive = person.change >= 0
          return (
            <div
              key={person.id}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-right-2"
              style={{
                animationDelay: `${(index + 4) * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-linear-to-br from-accent/80 to-chart-1 text-accent-foreground text-sm font-semibold">
                      {person.avatar ||
                        (person.name || person.email)
                          .substring(0, 2)
                          .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {person.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning text-[10px] font-bold flex items-center justify-center text-background">
                      {person.rank}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {person.name || person.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {person.deals} deal{person.deals !== 1 ? "s" : ""} closed
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ${(person.revenue / 1000).toFixed(1)}k
                </p>
                <div
                  className={`flex items-center justify-end gap-1 text-xs ${
                    isPositive ? "text-success" : "text-destructive"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositive ? `+${person.change}%` : `${person.change}%`}
                </div>
              </div>
            </div>
          )
        })}
        {topMembers.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground bg-accent/5 rounded-lg border border-border border-dashed">
            No performers yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
