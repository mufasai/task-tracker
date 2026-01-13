"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Task, Project, DashboardStats } from "@/types"
import {
  CheckCircle2,
  Circle,
  Clock,
  Layout,
  ListTodo,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  FolderKanban
} from "lucide-react"
import Link from "next/link"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { taskService } from "@/lib/services/tasks"
import { projectService } from "@/lib/services/projects"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
    totalProjects: 0,
    completionRate: 0
  })
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [userName, setUserName] = useState("User")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile/name
      if (user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      } else {
        setUserName(user.email?.split('@')[0] || "User")
      }

      // Fetch all data in parallel
      const [allTasks, allProjects] = await Promise.all([
        taskService.getAllTasks(supabase),
        projectService.getAllAccessibleProjects(supabase)
      ])

      const tasks = allTasks || []
      const projectsList = allProjects || []

      // Calculate stats
      const todoTasks = tasks.filter(t => t.status === "todo").length
      const inProgressTasks = tasks.filter(t => t.status === "in-progress").length
      const doneTasks = tasks.filter(t => t.status === "done").length
      const totalTasks = tasks.length
      const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

      setStats({
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        totalProjects: projectsList.length,
        completionRate
      })
      // Get recent tasks with project info
      const recentTasksData = tasks
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(task => ({
          ...task,
          project: projectsList.find(p => p.id === task.project_id)
        }))
      setRecentTasks(recentTasksData as Task[])

      // Get projects with task count
      const projectsWithCount = projectsList.map(project => ({
        ...project,
        taskCount: tasks.filter(t => t.project_id === project.id).length
      }))
      setProjects(projectsWithCount)

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card flex-shrink-0 z-40 shadow-sm bg-card/95">
        <div className="px-8 py-6 relative">
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's your productivity overview</p>
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <NotificationsDropdown />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Tasks</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stats.totalTasks}</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inProgressTasks}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.doneTasks}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.totalTasks > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Overall Progress</h3>
              <span className="text-sm text-muted-foreground">
                {stats.doneTasks} of {stats.totalTasks} tasks completed
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-purple-500" />
              Recent Tasks
            </h3>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <ListTodo className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No tasks yet</p>
                <p className="text-muted-foreground text-xs mt-1">Create a project and add tasks to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      {task.project && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: task.project.color }}
                          />
                          {task.project.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-500" />
              Your Projects
            </h3>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <FolderKanban className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No projects yet</p>
                <p className="text-muted-foreground text-xs mt-1">Click "Add Project / Folder" in the sidebar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/project/${project.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1 text-sm text-foreground truncate">{project.name}</span>
                    <span className="text-xs text-muted-foreground">{project.taskCount} tasks</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
                {projects.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{projects.length - 5} more projects
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {stats.totalTasks === 0 && stats.totalProjects === 0 && (
          <div className="bg-gradient-to-br from-purple-600/5 to-blue-600/5 border border-purple-500/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Ready to get productive?</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first project from the sidebar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
