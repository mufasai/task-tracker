"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, Mail, Lock, Trash2, Save } from "lucide-react"

export default function SettingsPage() {
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({ tasks: 0, projects: 0, folders: 0 })
  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email || "")

      // Fetch stats
      const [tasksRes, projectsRes, foldersRes] = await Promise.all([
        supabase.from("tasks").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("projects").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("folders").select("id", { count: "exact" }).eq("user_id", user.id)
      ])

      setStats({
        tasks: tasksRes.count || 0,
        projects: projectsRes.count || 0,
        folders: foldersRes.count || 0
      })
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
    )

    if (!confirmed) return

    const doubleConfirm = prompt("Type 'DELETE' to confirm account deletion:")
    if (doubleConfirm !== "DELETE") {
      toast.error("Account deletion cancelled")
      return
    }

    setIsLoading(true)
    try {
      // Delete all user data first
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("tasks").delete().eq("user_id", user.id)
        await supabase.from("projects").delete().eq("user_id", user.id)
        await supabase.from("folders").delete().eq("user_id", user.id)
      }

      // Note: Full account deletion requires admin API or edge function
      await supabase.auth.signOut()
      toast.success("Account data deleted. Please contact support for full account removal.")
      window.location.href = "/"
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-card/95 flex-shrink-0">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl space-y-6 pb-8">
          {/* Account Info */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{email}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.tasks}</p>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.projects}</p>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.folders}</p>
                  <p className="text-sm text-muted-foreground">Folders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Change Password
            </h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLoading || !newPassword || !confirmPassword}>
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border border-destructive/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your tasks, projects, and folders will be permanently deleted.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
