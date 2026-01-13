import { SupabaseClient } from "@supabase/supabase-js"
import { Project, Folder } from "@/types"

export const projectService = {
    getProjects: async (supabase: SupabaseClient, userId: string) => {
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true })

        if (error) throw error
        return data as Project[]
    },

    getAllAccessibleProjects: async (supabase: SupabaseClient) => {
        // RLS handles visibility, so just select * works if designed correctly, 
        // but explicitly for dashboard we might want a simple select
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: true })

        if (error) throw error
        return data as Project[]
    },

    getProjectById: async (supabase: SupabaseClient, id: string) => {
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("id", id)
            .single()

        if (error) throw error
        return data as Project
    },

    createProject: async (supabase: SupabaseClient, project: Partial<Project>) => {
        const { data, error } = await supabase
            .from("projects")
            .insert([project])
            .select()

        if (error) throw error
        return data?.[0] as Project
    },

    updateProject: async (supabase: SupabaseClient, id: string, updates: Partial<Project>) => {
        const { error } = await supabase
            .from("projects")
            .update(updates)
            .eq("id", id)

        if (error) throw error
    },

    deleteProject: async (supabase: SupabaseClient, id: string) => {
        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", id)

        if (error) throw error
    }
}

export const folderService = {
    getFolders: async (supabase: SupabaseClient, userId: string) => {
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true })

        if (error) throw error
        return data as Folder[]
    },

    createFolder: async (supabase: SupabaseClient, folder: Partial<Folder>) => {
        const { data, error } = await supabase
            .from("folders")
            .insert([folder])
            .select()

        if (error) throw error
        return data?.[0] as Folder
    },

    deleteFolder: async (supabase: SupabaseClient, id: string) => {
        // First remove projects from folder
        await supabase.from("projects").update({ folder_id: null }).eq("folder_id", id)

        const { error } = await supabase
            .from("folders")
            .delete()
            .eq("id", id)

        if (error) throw error
    }
}
