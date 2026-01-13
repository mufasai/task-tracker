"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, X, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface InviteCollaboratorModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    projectName: string
}

export function InviteCollaboratorModal({
    open,
    onOpenChange,
    projectId,
    projectName
}: InviteCollaboratorModalProps) {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // Find user by email
            const { data: targetUser, error: userError } = await supabase
                .from("user_profiles")
                .select("id, email, display_name")
                .eq("email", email.toLowerCase().trim())
                .single()

            if (userError || !targetUser) {
                toast.error("User not found. They need to sign up first.")
                return
            }

            if (targetUser.id === user.id) {
                toast.error("You can't invite yourself")
                return
            }

            // Check if already invited
            const { data: existing } = await supabase
                .from("collaborators")
                .select("id, status")
                .eq("project_id", projectId)
                .eq("user_id", targetUser.id)
                .single()

            if (existing) {
                toast.error(`User already ${existing.status === 'pending' ? 'invited' : 'a collaborator'}`)
                return
            }

            // Create collaboration invite
            const { error: collabError } = await supabase
                .from("collaborators")
                .insert({
                    project_id: projectId,
                    user_id: targetUser.id,
                    invited_by: user.id,
                    role: "member",
                    status: "pending"
                })

            if (collabError) throw collabError

            // Create notification for invited user
            const { data: inviterProfile } = await supabase
                .from("user_profiles")
                .select("display_name, email")
                .eq("id", user.id)
                .single()

            await supabase.from("notifications").insert({
                user_id: targetUser.id,
                type: "invite",
                title: "Project Invitation",
                message: `${inviterProfile?.display_name || inviterProfile?.email} invited you to collaborate on "${projectName}"`,
                data: {
                    project_id: projectId,
                    project_name: projectName,
                    invited_by: user.id,
                    inviter_name: inviterProfile?.display_name || inviterProfile?.email
                }
            })

            toast.success(`Invitation sent to ${targetUser.display_name || email}`)
            setEmail("")
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Failed to send invitation")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-purple-500" />
                        Invite Collaborator
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Invite someone to collaborate on <span className="font-medium text-foreground">"{projectName}"</span>
                </p>

                <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            The user must have an account to receive the invitation
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !email.trim()}>
                            {isLoading ? "Sending..." : "Send Invitation"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
