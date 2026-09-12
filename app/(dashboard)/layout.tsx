import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: {
    default: "SalesOps Dashboard",
    template: "%s | SalesOps Dashboard",
  },
  description: "Sales operations performance workspace.",
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
