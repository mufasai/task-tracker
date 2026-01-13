import { SupabaseClient } from "@supabase/supabase-js"
import { Task } from "@/types"

export const taskService = {
    getAllTasks: async (supabase: SupabaseClient) => {
        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error
        return data as Task[]
    },

    getTasksByProject: async (supabase: SupabaseClient, projectId: string) => {
        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })

        if (error) throw error
        return data as Task[]
    },

    getTasksByDateRange: async (supabase: SupabaseClient, startDate: string, endDate: string) => {
        const { data, error } = await supabase
            .from("tasks")
            .select("*, project:projects(name, color)")
            .gte("due_date", startDate)
            .lte("due_date", endDate)

        if (error) throw error
        return data as Task[]
    },

    createTask: async (supabase: SupabaseClient, task: Partial<Task>) => {
        const { data, error } = await supabase
            .from("tasks")
            .insert([task])
            .select()

        if (error) throw error
        return data?.[0] as Task
    },

    updateTask: async (supabase: SupabaseClient, id: string, updates: Partial<Task>) => {
        const { error } = await supabase
            .from("tasks")
            .update(updates)
            .eq("id", id)

        if (error) throw error
    },

    deleteTask: async (supabase: SupabaseClient, id: string) => {
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", id)

        if (error) throw error
    }
}
