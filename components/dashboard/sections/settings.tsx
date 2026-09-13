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
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useChangePassword,
  useSession,
  useUpdateProfile,
} from "@/hooks/use-auth"
import {
  useAddTeamMember,
  useRemoveTeamMember,
  useTeamMembers,
  useUpdateTeamMember,
} from "@/hooks/use-team"

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState("profile")

  // ── Team state ─────────────────────────────────────────────
  const { data: members = [], isLoading: isLoadingMembers } = useTeamMembers()
  const {
    mutate: addTeamMember,
    isPending: isAddingMember,
    error: addTeamMemberError,
  } = useAddTeamMember()
  const { mutate: updateTeamMember, isPending: isUpdatingMember } =
    useUpdateTeamMember()
  const { mutate: removeTeamMember, isPending: isRemovingMember } =
    useRemoveTeamMember()
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberPassword, setNewMemberPassword] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("STAFF")

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
    if (
      !currentPassword ||
      newPassword.length < 8 ||
      newPassword !== confirmPassword
    )
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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    addTeamMember(
      {
        name: newMemberName,
        email: newMemberEmail,
        password: newMemberPassword,
        role: newMemberRole,
      },
      {
        onSuccess: () => {
          setIsAddMemberOpen(false)
          setNewMemberName("")
          setNewMemberEmail("")
          setNewMemberPassword("")
          setNewMemberRole("STAFF")
        },
      },
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
    : (session?.email?.substring(0, 2).toUpperCase() ?? "??")

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

          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
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
              <CardDescription>Update your personal details</CardDescription>
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
                    readOnly
                    placeholder="you@company.com"
                    className="bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
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

        {/* ── Members Tab ────────────────────────────────────── */}
        <TabsContent
          value="members"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage your team members and their roles.
                </CardDescription>
              </div>
              {(session?.role === "OWNER" || session?.role === "ADMIN") && (
                <Dialog
                  open={isAddMemberOpen}
                  onOpenChange={setIsAddMemberOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Invite a new member to your business account.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMember} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberName">Name</Label>
                        <Input
                          id="memberName"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberEmail">Email</Label>
                        <Input
                          id="memberEmail"
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberPassword">Password</Label>
                        <Input
                          id="memberPassword"
                          type="password"
                          value={newMemberPassword}
                          onChange={(e) => setNewMemberPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberRole">Role</Label>
                        <Select
                          value={newMemberRole}
                          onValueChange={setNewMemberRole}
                        >
                          <SelectTrigger id="memberRole">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            {session?.role === "OWNER" && (
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {addTeamMemberError && (
                        <p className="text-sm text-destructive">
                          {addTeamMemberError instanceof Error
                            ? addTeamMemberError.message
                            : "Failed to add member."}
                        </p>
                      )}

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={
                            isAddingMember ||
                            !newMemberName ||
                            !newMemberEmail ||
                            newMemberPassword.length < 8
                          }
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          {isAddingMember ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Member"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="flex justify-center p-4">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => {
                    const currentUserRole = session?.role || "STAFF"
                    const canManage =
                      currentUserRole === "OWNER" ||
                      (currentUserRole === "ADMIN" && member.role === "STAFF")

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20 transition-all hover:bg-secondary/40"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 bg-secondary">
                            <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
                              {member.name
                                ? member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                : member.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {member.name || "No name"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="outline"
                            className={
                              member.role === "OWNER"
                                ? "border-accent/50 text-accent"
                                : member.role === "ADMIN"
                                  ? "border-primary/50 text-primary"
                                  : "border-muted-foreground/50 text-muted-foreground"
                            }
                          >
                            {member.role}
                          </Badge>
                          {canManage ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={
                                    isUpdatingMember || isRemovingMember
                                  }
                                >
                                  Manage
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {currentUserRole === "OWNER" &&
                                  member.role === "STAFF" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateTeamMember({
                                          id: member.id,
                                          role: "ADMIN",
                                        })
                                      }
                                    >
                                      Promote to Admin
                                    </DropdownMenuItem>
                                  )}
                                {currentUserRole === "OWNER" &&
                                  member.role === "ADMIN" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateTeamMember({
                                          id: member.id,
                                          role: "STAFF",
                                        })
                                      }
                                    >
                                      Demote to Staff
                                    </DropdownMenuItem>
                                  )}
                                <DropdownMenuItem
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Are you sure you want to remove ${member.name || member.email} from the team?`,
                                      )
                                    ) {
                                      removeTeamMember(member.id)
                                    }
                                  }}
                                >
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button variant="ghost" size="sm" disabled>
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {members.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No team members found.
                    </p>
                  )}
                </div>
              )}
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
