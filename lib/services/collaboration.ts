import { SupabaseClient } from "@supabase/supabase-js"
import { Collaborator, Notification, Project } from "@/types"

export const collaborationService = {
    getSharedProjects: async (supabase: SupabaseClient, userId: string) => {
        const { data, error } = await supabase
            .from("collaborators")
            .select("project_id, projects(id, name, color, user_id)")
            .eq("user_id", userId)
            .eq("status", "accepted")

        if (error) throw error

        if (!data) return []

        return data
            .filter((c: any) => c.projects)
            .map((c: any) => ({
                id: c.projects.id,
                name: c.projects.name,
                color: c.projects.color,
                isShared: true,
                user_id: c.projects.user_id
            } as Project))
    },

    inviteCollaborator: async (supabase: SupabaseClient, projectId: string, email: string) => {
        // 1. Get user by email
        const { data: userData, error: userError } = await supabase
            .from("user_profiles") // Assuming we have this, otherwise we rely on auth users which is harder to query client side
            .select("id")
            .eq("email", email)
            .single()

        // Fallback if no user profile table or not found (simplified)
        // Real implementation often requires an edge function to search users securely
        if (userError || !userData) throw new Error("User not found")

        const invitedUserId = userData.id
        const { data: { user } } = await supabase.auth.getUser()

        // 2. Insert collaborator
        const { error: inviteError } = await supabase
            .from("collaborators")
            .insert([{
                project_id: projectId,
                user_id: invitedUserId,
                invited_by: user?.id,
                status: "pending"
            }])

        if (inviteError) throw inviteError

        // 3. Create notification
        await notificationService.createNotification(supabase, {
            user_id: invitedUserId,
            type: "invite",
            title: "New Project Invitation",
            message: `You have been invited to collaborate on a project`,
            data: { project_id: projectId }
        })
    }
}

export const notificationService = {
    getNotifications: async (supabase: SupabaseClient, userId: string) => {
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20)

        if (error) throw error
        return data as Notification[]
    },

    markAsRead: async (supabase: SupabaseClient, id: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id)

        if (error) throw error
    },

    markAllAsRead: async (supabase: SupabaseClient, userId: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", userId)
            .eq("is_read", false)

        if (error) throw error
    },

    deleteNotification: async (supabase: SupabaseClient, id: string) => {
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id)

        if (error) throw error
    },

    createNotification: async (supabase: SupabaseClient, notification: Partial<Notification>) => {
        const { error } = await supabase
            .from("notifications")
            .insert([notification])

        if (error) throw error
    }
}
