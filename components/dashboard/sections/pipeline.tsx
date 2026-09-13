"use client"

import {
  Building2,
  Clock,
  DollarSign,
  MoreHorizontal,
  Plus,
  User,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Deal {
  id: string
  company: string
  value: number
  rep: string
  daysInStage: number
  probability: number
}

interface Stage {
  id: string
  name: string
  deals: Deal[]
  total: number
}

const initialStages: Stage[] = [
  {
    id: "lead",
    name: "Lead",
    total: 892000,
    deals: [
      {
        id: "1",
        company: "Nexus Technologies",
        value: 45000,
        rep: "Sarah C.",
        daysInStage: 3,
        probability: 20,
      },
      {
        id: "2",
        company: "Bright Systems",
        value: 78000,
        rep: "Mike J.",
        daysInStage: 5,
        probability: 25,
      },
      {
        id: "3",
        company: "CoreLogic Inc",
        value: 32000,
        rep: "Emily D.",
        daysInStage: 1,
        probability: 15,
      },
    ],
  },
  {
    id: "qualified",
    name: "Qualified",
    total: 556000,
    deals: [
      {
        id: "4",
        company: "DataPrime Ltd",
        value: 125000,
        rep: "James W.",
        daysInStage: 7,
        probability: 40,
      },
      {
        id: "5",
        company: "CloudNine Corp",
        value: 89000,
        rep: "Sarah C.",
        daysInStage: 4,
        probability: 45,
      },
    ],
  },
  {
    id: "proposal",
    name: "Proposal",
    total: 357000,
    deals: [
      {
        id: "6",
        company: "TechForward",
        value: 167000,
        rep: "Mike J.",
        daysInStage: 12,
        probability: 60,
      },
      {
        id: "7",
        company: "Innovate Plus",
        value: 95000,
        rep: "Lisa P.",
        daysInStage: 8,
        probability: 65,
      },
      {
        id: "8",
        company: "SmartGrid Co",
        value: 54000,
        rep: "Emily D.",
        daysInStage: 6,
        probability: 55,
      },
    ],
  },
  {
    id: "negotiation",
    name: "Negotiation",
    total: 179000,
    deals: [
      {
        id: "9",
        company: "Enterprise Max",
        value: 245000,
        rep: "Sarah C.",
        daysInStage: 15,
        probability: 80,
      },
      {
        id: "10",
        company: "GrowthLab",
        value: 112000,
        rep: "James W.",
        daysInStage: 10,
        probability: 75,
      },
    ],
  },
]

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop card, hover state only
    <Card
      className="group bg-background p-4 cursor-grab active:cursor-grabbing hover:border-accent/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground truncate max-w-30">
            {deal.company}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className={cn(
            "w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-foreground font-semibold mb-3">
        <DollarSign className="w-3.5 h-3.5 text-accent" />$
        {deal.value.toLocaleString()}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {deal.rep}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {deal.daysInStage}d
        </div>
      </div>

      {/* Probability bar */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Probability</span>
          <span className="text-foreground font-medium">
            {deal.probability}%
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${deal.probability}%` }}
          />
        </div>
      </div>
    </Card>
  )
}

export function PipelineSection() {
  const [stages] = useState(initialStages)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage and track your sales pipeline
          </p>
        </div>
        <Button
          variant="default"
          type="button"
          className="flex items-center gap-2 bg-accent text-accent-foreground font-medium hover:bg-accent/90"
        >
          <Plus className="w-4 h-4" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, stageIndex) => (
          <Card
            key={stage.id}
            className="p-4 min-h-125 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              animationDelay: `${stageIndex * 100}ms`,
              animationFillMode: "both",
            }}
          >
            {/* Stage header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {stage.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 font-medium text-muted-foreground"
                >
                  {stage.deals.length}
                </Badge>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                ${(stage.total / 1000).toFixed(0)}k
              </span>
            </div>

            {/* Deals */}
            <div className="space-y-3">
              {stage.deals.map((deal, dealIndex) => (
                <DealCard key={deal.id} deal={deal} index={dealIndex} />
              ))}
            </div>

            {/* Add deal to stage */}
            <Button
              variant="outline"
              type="button"
              className="w-full mt-3 flex items-center justify-center gap-2 border-dashed text-muted-foreground hover:text-foreground hover:border-accent/50 hover:bg-secondary/50 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add deal
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
