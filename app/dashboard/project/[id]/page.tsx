"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { TaskCard } from "@/components/task-card"
import { AddTaskModal } from "@/components/add-task-modal"
import { EditTaskModal } from "@/components/edit-task-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { InviteCollaboratorModal } from "@/components/invite-collaborator-modal"
import { toast } from "sonner"
import { AnimatePresence } from "framer-motion"
import { Task, Project } from "@/types"
import { taskService } from "@/lib/services/tasks"
import { projectService } from "@/lib/services/projects"

export default function ProjectPage() {
    const params = useParams()
    const projectId = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | undefined>()
    const [taskToDelete, setTaskToDelete] = useState<Task | undefined>()
    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        let channel: any

        const init = async () => {
            await fetchProjectAndTasks()
            channel = supabase
                .channel(`project-tasks-${projectId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `project_id=eq.${projectId}`
                }, (payload) => {
                    handleRealtimeUpdate(payload)
                })
                .subscribe()
        }

        init()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [projectId])

    const fetchProjectAndTasks = async () => {
        try {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch project
            const projectData = await projectService.getProjectById(supabase, projectId)
            setProject(projectData)

            // Fetch tasks for this project
            const tasksData = await taskService.getTasksByProject(supabase, projectId)
            setTasks(tasksData || [])
        } catch (error) {
            toast.error("Failed to load project")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRealtimeUpdate = (payload: any) => {
        if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new as Task, ...prev])
        } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) => prev.map((task) => task.id === payload.new.id ? payload.new as Task : task))
        } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
        }
    }

    const handleAddTask = async (title: string, description: string) => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError || !user) throw new Error("User not authenticated")

            const newTask = await taskService.createTask(supabase, {
                title,
                description: description || undefined,
                status: "todo",
                user_id: user.id,
                project_id: projectId,
            })

            if (newTask) {
                setTasks([newTask, ...tasks])
                toast.success("Task created successfully!")
            }
        } catch (error) {
            toast.error("Failed to create task")
            console.error(error)
        }
    }

    const handleEditTask = async (id: string, title: string, description: string, dueDate: string | null) => {
        try {
            await taskService.updateTask(supabase, id, {
                title,
                description: description || undefined,
                due_date: dueDate,
                updated_at: new Date().toISOString()
            })

            setTasks(tasks.map((t) => (t.id === id ? { ...t, title, description, due_date: dueDate } : t)))
            toast.success("Task updated successfully!")
        } catch (error) {
            toast.error("Failed to update task")
            console.error(error)
        }
    }

    const handleStatusChange = async (id: string, status: "todo" | "in-progress" | "done") => {
        try {
            await taskService.updateTask(supabase, id, {
                status,
                updated_at: new Date().toISOString()
            })

            setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)))
            toast.success(`Task marked as ${status}!`)
        } catch (error) {
            toast.error("Failed to update task status")
            console.error(error)
        }
    }

    const handleDeleteTask = async (id: string) => {
        try {
            await taskService.deleteTask(supabase, id)
            setTasks(tasks.filter((t) => t.id !== id))
            toast.success("Task deleted successfully!")
        } catch (error) {
            toast.error("Failed to delete task")
            console.error(error)
        }
    }

    const todoTasks = tasks.filter((t) => t.status === "todo")
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress")
    const doneTasks = tasks.filter((t) => t.status === "done")

    return (
        <div className="h-full flex flex-col bg-background">
            <Header
                onAddTask={() => setAddModalOpen(true)}
                onInvite={() => setInviteModalOpen(true)}
                title={project?.name || "Project"}
                subtitle="Manage your project tasks"
                showInvite={true}
            />

            <div className="flex-1 overflow-y-auto">
                <div className="p-8 pb-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                                <p className="text-muted-foreground">Loading tasks...</p>
                            </div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-6">
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center border"
                                style={{
                                    backgroundColor: `${project?.color}20`,
                                    borderColor: `${project?.color}40`
                                }}
                            >
                                <span className="text-4xl">📋</span>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-foreground text-xl font-medium">No tasks in this project</p>
                                <p className="text-muted-foreground">Add your first task to get started</p>
                            </div>
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Add first task
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* To Do Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-purple-800 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]"></div>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        To Do <span className="text-muted-foreground text-sm ml-2">({todoTasks.length})</span>
                                    </h2>
                                </div>
                                <AnimatePresence>
                                    {todoTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            onEdit={(id) => {
                                                setSelectedTask(tasks.find((t) => t.id === id))
                                                setEditModalOpen(true)
                                            }}
                                            onDelete={(id) => {
                                                setTaskToDelete(tasks.find((t) => t.id === id))
                                                setDeleteModalOpen(true)
                                            }}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* In Progress Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        In Progress <span className="text-muted-foreground text-sm ml-2">({inProgressTasks.length})</span>
                                    </h2>
                                </div>
                                <AnimatePresence>
                                    {inProgressTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            onEdit={(id) => {
                                                setSelectedTask(tasks.find((t) => t.id === id))
                                                setEditModalOpen(true)
                                            }}
                                            onDelete={(id) => {
                                                setTaskToDelete(tasks.find((t) => t.id === id))
                                                setDeleteModalOpen(true)
                                            }}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Done Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-green-800 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        Done <span className="text-muted-foreground text-sm ml-2">({doneTasks.length})</span>
                                    </h2>
                                </div>
                                <AnimatePresence>
                                    {doneTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            onEdit={(id) => {
                                                setSelectedTask(tasks.find((t) => t.id === id))
                                                setEditModalOpen(true)
                                            }}
                                            onDelete={(id) => {
                                                setTaskToDelete(tasks.find((t) => t.id === id))
                                                setDeleteModalOpen(true)
                                            }}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddTaskModal open={addModalOpen} onOpenChange={setAddModalOpen} onSubmit={handleAddTask} />
            <EditTaskModal open={editModalOpen} onOpenChange={setEditModalOpen} task={selectedTask} onSubmit={handleEditTask} />
            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                taskTitle={taskToDelete?.title || ""}
                onConfirm={() => handleDeleteTask(taskToDelete?.id || "")}
            />
            <InviteCollaboratorModal
                open={inviteModalOpen}
                onOpenChange={setInviteModalOpen}
                projectId={projectId}
                projectName={project?.name || ""}
            />
        </div>
    )
}
