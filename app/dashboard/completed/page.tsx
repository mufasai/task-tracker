"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { TaskCard } from "@/components/task-card"
import { EditTaskModal } from "@/components/edit-task-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { toast } from "sonner"
import { AnimatePresence } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "done"
}

export default function CompletedPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>()
  const supabase = createClient()

  useEffect(() => {
    fetchCompletedTasks()
  }, [])

  const fetchCompletedTasks = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "done")
        .order("updated_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      toast.error("Failed to load completed tasks")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditTask = async (id: string, title: string, description: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title,
          description: description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
      setTasks(tasks.map((t) => (t.id === id ? { ...t, title, description } : t)))
      toast.success("Task updated successfully!")
    } catch (error) {
      toast.error("Failed to update task")
      console.error(error)
    }
  }

  const handleStatusChange = async (id: string, status: "todo" | "in-progress" | "done") => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
      setTasks(tasks.filter((t) => t.id !== id))
      toast.success(`Task moved to ${status}!`)
    } catch (error) {
      toast.error("Failed to update task status")
      console.error(error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) throw error
      setTasks(tasks.filter((t) => t.id !== id))
      toast.success("Task deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete task")
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-black to-emerald-900/20 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-600/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none"></div>

      <Header onAddTask={() => {}} />

      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-8 pb-12">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-green-600/30 border-t-green-600 rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading completed tasks...</p>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 flex items-center justify-center border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-gray-300 text-xl font-medium">No completed tasks yet</p>
                <p className="text-gray-500">Complete tasks to see them here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Header with Stats */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Completed Tasks</h2>
                  <p className="text-gray-400">
                    You've completed <span className="text-green-400 font-semibold">{tasks.length}</span>{" "}
                    {tasks.length === 1 ? "task" : "tasks"}
                  </p>
                </div>
              </div>

              {/* Completed Tasks List */}
              <AnimatePresence>
                {tasks.map((task) => (
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
          )}
        </div>
      </div>

      <EditTaskModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        task={selectedTask}
        onSubmit={handleEditTask}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        taskTitle={taskToDelete?.title || ""}
        onConfirm={() => handleDeleteTask(taskToDelete?.id || "")}
      />
    </div>
  )
}
