export interface Project {
    id: string
    name: string
    color: string
    folder_id: string | null
    user_id: string
    created_at?: string
    isShared?: boolean
    // Extended properties for UI
    taskCount?: number
    owner_name?: string
}

export interface Folder {
    id: string
    name: string
    color: string
    user_id: string
    created_at?: string
}

export interface Task {
    id: string
    title: string
    description?: string
    status: "todo" | "in-progress" | "done"
    due_date?: string | null
    project_id: string | null
    user_id: string
    created_at: string
    updated_at?: string
    // Extended properties for UI
    project?: {
        name: string
        color: string
    }
}

export interface Notification {
    id: string
    type: string
    title: string
    message: string
    data: any
    is_read: boolean
    created_at: string
    user_id: string
}

export interface UserProfile {
    id: string
    email: string
    display_name?: string
    avatar_url?: string
}

export interface Collaborator {
    id: string
    project_id: string
    user_id: string
    invited_by: string
    role: string
    status: "pending" | "accepted" | "rejected"
    created_at: string
    project?: Project
}

export interface DashboardStats {
    totalTasks: number
    todoTasks: number
    inProgressTasks: number
    doneTasks: number
    totalProjects: number
    completionRate: number
}
