"use client"

import { formatDistanceToNow } from "date-fns"
import { ArrowUpRight, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRecentDeals } from "@/hooks/use-deals"

const statusConfig = {
  won: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    label: "Won",
  },
  pending: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Pending",
  },
  lost: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Lost",
  },
}

export function RecentDeals() {
  const { data: deals = [], isLoading } = useRecentDeals()

  if (isLoading) {
    return (
      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2 mb-3 space-y-0">
          <div>
            <CardTitle className="text-base">Recent Deals</CardTitle>
            <CardDescription className="mt-0.5">
              Latest activity
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          Loading deals...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mb-3 space-y-0">
        <div>
          <CardTitle className="text-base">Recent Deals</CardTitle>
          <CardDescription className="mt-0.5">Latest activity</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="text-accent hover:text-accent/80 hover:bg-transparent px-2 group"
        >
          View all
          <ArrowUpRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {deals.map((deal, index) => {
          const status = statusConfig[deal.status as keyof typeof statusConfig]
          const StatusIcon = status.icon

          return (
            <div
              key={deal.company}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-left-2"
              style={{
                animationDelay: `${(index + 3) * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 rounded-lg">
                  <AvatarFallback className="bg-secondary text-muted-foreground text-sm font-semibold rounded-lg group-hover:bg-accent/10 group-hover:text-accent transition-all duration-200">
                    {deal.company.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {deal.company}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {deal.rep} •{" "}
                    {formatDistanceToNow(new Date(deal.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  ${(deal.value / 1000).toFixed(1)}k
                </span>
                <Badge
                  variant={
                    deal.status === "won"
                      ? "success"
                      : deal.status === "pending"
                        ? "warning"
                        : "destructive"
                  }
                >
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </Badge>
              </div>
            </div>
          )
        })}
        {deals.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground bg-accent/5 rounded-lg border border-border border-dashed">
            No recent deals.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
