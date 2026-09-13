"use client"

import {
  Bell,
  Check,
  ExternalLink,
  Link2,
  Mail,
  RefreshCw,
  Shield,
  Smartphone,
  User,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession, useUpdateProfile, useChangePassword } from "@/hooks/use-auth"

const integrations = [
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Sync contacts and opportunities",
    connected: true,
    lastSync: "2 hours ago",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Marketing automation and CRM",
    connected: true,
    lastSync: "5 mins ago",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team notifications and alerts",
    connected: true,
    lastSync: "Real-time",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email tracking and sync",
    connected: false,
    lastSync: null,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Meeting scheduling",
    connected: false,
    lastSync: null,
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Video conferencing integration",
    connected: true,
    lastSync: "1 hour ago",
  },
]

const notificationSettings = [
  {
    id: "deal_updates",
    label: "Deal Updates",
    description: "Get notified when deals change status",
    email: true,
    push: true,
  },
  {
    id: "team_activity",
    label: "Team Activity",
    description: "Updates on team performance and milestones",
    email: true,
    push: false,
  },
  {
    id: "pipeline_alerts",
    label: "Pipeline Alerts",
    description: "Alerts for pipeline changes and risks",
    email: true,
    push: true,
  },
  {
    id: "forecast_updates",
    label: "Forecast Updates",
    description: "Weekly forecast summary reports",
    email: true,
    push: false,
  },
  {
    id: "customer_health",
    label: "Customer Health",
    description: "Alerts when customer health scores drop",
    email: false,
    push: true,
  },
]

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState("profile")
  const [notifications, setNotifications] = useState(notificationSettings)

  // ── Profile state ──────────────────────────────────────────
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const updateProfile = useUpdateProfile()
  const profileError =
    updateProfile.error instanceof Error ? updateProfile.error.message : ""
  const profileSuccess = updateProfile.isSuccess

  // Seed form with session data once loaded.
  // Guard with ?? "" on every field so inputs are ALWAYS controlled (never undefined).
  useEffect(() => {
    if (session) {
      setName(session.name ?? "")
      setEmail(session.email ?? "")
    }
  }, [session])

  // ── Password state ─────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const changePassword = useChangePassword()
  const passwordError =
    changePassword.error instanceof Error ? changePassword.error.message : ""
  const passwordSuccess = changePassword.isSuccess

  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleSaveProfile = () => {
    if (!name || !email) return
    updateProfile.mutate({ name, email })
  }

  const handleChangePassword = () => {
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword)
      return
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        },
      },
    )
  }

  const toggleNotification = (id: string, type: "email" | "push") => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [type]: !n[type] } : n)),
    )
  }

  // Derive initials from current session
  const initials = session?.name
    ? session.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : session?.email?.substring(0, 2).toUpperCase() ?? "??"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences and integrations
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-secondary border border-border p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          {/* <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger> */}
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ────────────────────────────────────── */}
        <TabsContent
          value="profile"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar row */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 bg-secondary">
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-name">Full name</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-secondary border-border focus:border-accent"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-email">Email address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="bg-secondary border-border focus:border-accent"
                  />
                </div>
              </div>

              {/* Feedback */}
              {profileError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {profileError}
                </p>
              )}
              {profileSuccess && (
                <p className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
                  Profile updated successfully.
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={updateProfile.isPending || !name || !email}
                >
                  {updateProfile.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications Tab ──────────────────────────────── */}
        <TabsContent
          value="notifications"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr,80px,80px] gap-4 pb-3 border-b border-border text-sm text-muted-foreground">
                  <span>Notification Type</span>
                  <span className="text-center flex items-center justify-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <span className="text-center flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    Push
                  </span>
                </div>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="grid grid-cols-[1fr,80px,80px] gap-4 py-4 border-b border-border last:border-0 animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {notification.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={notification.email}
                        onCheckedChange={() =>
                          toggleNotification(notification.id, "email")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={notification.push}
                        onCheckedChange={() =>
                          toggleNotification(notification.id, "push")
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Integrations Tab ───────────────────────────────── */}
        <TabsContent
          value="integrations"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Connected Services
              </CardTitle>
              <CardDescription>
                Manage your third-party integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration, index) => (
                  <div
                    key={integration.id}
                    className={`p-4 rounded-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${integration.connected
                        ? "bg-secondary/50 border-border hover:border-accent/50"
                        : "bg-secondary/20 border-border hover:border-muted-foreground/30"
                      }`}
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.connected ? "bg-accent/20" : "bg-muted"
                            }`}
                        >
                          <Zap
                            className={`w-5 h-5 ${integration.connected
                                ? "text-accent"
                                : "text-muted-foreground"
                              }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {integration.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          integration.connected
                            ? "bg-accent/20 text-accent border-accent/30"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {integration.connected ? "Connected" : "Not connected"}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {integration.connected ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            Last sync: {integration.lastSync}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                              Sync
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive"
                            >
                              Disconnect
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground">
                            Not configured
                          </span>
                          <Button
                            size="sm"
                            className="h-8 bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            Connect
                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security Tab ───────────────────────────────────── */}
        <TabsContent
          value="security"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-secondary border-border focus:border-accent max-w-md"
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-secondary border-border focus:border-accent max-w-md"
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-secondary border-border focus:border-accent max-w-md"
                  placeholder="Re-enter new password"
                />
                {passwordMismatch && (
                  <p className="text-xs text-destructive">
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Strength hints */}
              <div className="space-y-1 text-xs text-muted-foreground max-w-md">
                <p className={newPassword.length >= 8 ? "text-accent" : ""}>
                  • At least 8 characters
                </p>
                <p
                  className={
                    confirmPassword && newPassword === confirmPassword
                      ? "text-accent"
                      : ""
                  }
                >
                  • Passwords match
                </p>
              </div>

              {/* Feedback */}
              {passwordError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive max-w-md">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent max-w-md">
                  Password changed successfully.
                </p>
              )}

              <Button
                onClick={handleChangePassword}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={
                  changePassword.isPending ||
                  !currentPassword ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
              >
                {changePassword.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
