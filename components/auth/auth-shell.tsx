import Link from "next/link"
import type { ReactNode } from "react"

export function AuthShell({ children, eyebrow = "SalesOps" }: { children: ReactNode; eyebrow?: string }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
        <aside className="relative hidden overflow-hidden border-r border-border bg-card p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">S</span>
              SalesOps
            </Link>
            <div className="mt-28 max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Make every sales conversation count.</h1>
              <p className="mt-6 text-base leading-7 text-muted-foreground">A focused workspace for pipeline visibility, revenue confidence, and better team performance.</p>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="rounded-xl border border-border bg-background/60 p-4"><p className="text-2xl font-semibold text-foreground">+28%</p><p className="mt-1">win rate lift</p></div>
            <div className="rounded-xl border border-border bg-background/60 p-4"><p className="text-2xl font-semibold text-foreground">4.2x</p><p className="mt-1">pipeline coverage</p></div>
          </div>
        </aside>
        <section className="flex min-h-screen flex-col">
          <div className="flex items-center justify-between p-6 lg:justify-end lg:px-12 lg:pt-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold lg:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">S</span>SalesOps</Link>
            <span className="text-xs text-muted-foreground">Secure workspace access</span>
          </div>
          <div className="flex flex-1 items-start justify-center px-6 pb-12 pt-10 sm:px-12 lg:items-center lg:px-20 lg:pb-20 lg:pt-0">{children}</div>
          <p className="px-6 pb-6 text-center text-xs text-muted-foreground sm:px-12 lg:px-20 lg:pb-8 lg:text-right">By continuing, you agree to our <span className="text-foreground">Terms</span> and <span className="text-foreground">Privacy Policy</span>.</p>
        </section>
      </div>
    </main>
  )
}
