import {
  BarChart3,
  Building2,
  GitBranch,
  Handshake,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react"

export type Section =
  | "overview"
  | "pipeline"
  | "deals"
  | "customers"
  | "team"
  | "forecasting"
  | "reports"
  | "settings"

export interface NavItem {
  id: Section
  label: string
  icon: React.ElementType
  href: string
}

export const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    href: "/overview",
  },
  { id: "pipeline", label: "Pipeline", icon: GitBranch, href: "/pipeline" },
  { id: "deals", label: "Deals", icon: Handshake, href: "/deals" },
  { id: "customers", label: "Customers", icon: Building2, href: "/customers" },
  { id: "team", label: "Team", icon: Users, href: "/team" },
  {
    id: "forecasting",
    label: "Forecasting",
    icon: TrendingUp,
    href: "/forecasting",
  },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

export const sectionTitles: Record<Section, string> = {
  overview: "Overview",
  pipeline: "Pipeline",
  deals: "Deals",
  customers: "Customers",
  team: "Team Performance",
  forecasting: "Forecasting",
  reports: "Reports",
  settings: "Settings",
}
