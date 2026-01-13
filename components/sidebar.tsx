"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, PlusCircle, LogOut, FolderKanban, ChevronDown, ChevronRight, Trash2, Folder, Calendar, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ThemeToggle } from "./theme-toggle"
import { AddItemModal } from "./add-item-modal"
import { Project, Folder as FolderType } from "@/types"
import { projectService, folderService } from "@/lib/services/projects"
import { collaborationService } from "@/lib/services/collaboration"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [sharedProjects, setSharedProjects] = useState<Project[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const [isSharedOpen, setIsSharedOpen] = useState(true)
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null)
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)
  const [dragOverRoot, setDragOverRoot] = useState(false)

  useEffect(() => {
    let channel: any

    const init = async () => {
      await fetchData()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        channel = supabase
          .channel('sidebar-collaborators')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'collaborators',
            filter: `user_id=eq.${user.id}`
          }, () => {
            fetchSharedProjects(user.id)
          })
          .subscribe()
      }
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const fetchSharedProjects = async (userId: string) => {
    try {
      const shared = await collaborationService.getSharedProjects(supabase, userId)
      setSharedProjects(shared)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await Promise.all([
        (async () => {
          const data = await projectService.getProjects(supabase, user.id)
          setProjects(data)
        })(),
        (async () => {
          const data = await folderService.getFolders(supabase, user.id)
          setFolders(data)
        })(),
        fetchSharedProjects(user.id)
      ])

      const foldersWithProjects = new Set(
        (projects || []).filter(p => p.folder_id).map(p => p.folder_id!)
      )
      setOpenFolders(foldersWithProjects)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", projectId)
  }

  const handleDragEnd = () => {
    setDraggedProjectId(null)
    setDragOverFolderId(null)
    setDragOverRoot(false)
  }

  const handleDragOverFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverFolderId(folderId)
    setDragOverRoot(false)
  }

  const handleDragOverRoot = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverRoot(true)
    setDragOverFolderId(null)
  }

  const handleDragLeave = () => {
    setDragOverFolderId(null)
    setDragOverRoot(false)
  }

  const handleDropOnFolder = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedProjectId) return

    const project = projects.find(p => p.id === draggedProjectId)
    if (!project || project.folder_id === folderId) {
      handleDragEnd()
      return
    }

    try {
      await projectService.updateProject(supabase, draggedProjectId, { folder_id: folderId })

      setProjects(projects.map(p =>
        p.id === draggedProjectId ? { ...p, folder_id: folderId } : p
      ))
      setOpenFolders(prev => new Set([...prev, folderId]))
      toast.success(`Moved "${project.name}" to folder`)
    } catch (error) {
      toast.error("Failed to move project")
      console.error(error)
    }

    handleDragEnd()
  }

  const handleDropOnRoot = async (e: React.DragEvent) => {
    e.preventDefault()

    if (!draggedProjectId) return

    const project = projects.find(p => p.id === draggedProjectId)
    if (!project || project.folder_id === null) {
      handleDragEnd()
      return
    }

    try {
      await projectService.updateProject(supabase, draggedProjectId, { folder_id: null })

      setProjects(projects.map(p =>
        p.id === draggedProjectId ? { ...p, folder_id: null } : p
      ))
      toast.success(`Moved "${project.name}" out of folder`)
    } catch (error) {
      toast.error("Failed to move project")
      console.error(error)
    }

    handleDragEnd()
  }

  const handleAddProject = async (name: string, color: string, folderId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const newProject = await projectService.createProject(supabase, {
        name,
        color,
        user_id: user.id,
        folder_id: folderId
      })

      if (newProject) {
        setProjects([...projects, newProject])
        if (folderId) {
          setOpenFolders(prev => new Set([...prev, folderId]))
        }
        toast.success("Project created!")
        router.push(`/dashboard/project/${newProject.id}`)
      }
    } catch (error) {
      toast.error("Failed to create project")
      console.error(error)
    }
  }

  const handleAddFolder = async (name: string, color: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const newFolder = await folderService.createFolder(supabase, {
        name,
        color,
        user_id: user.id
      })

      if (newFolder) {
        setFolders([...folders, newFolder])
        toast.success("Folder created!")
      }
    } catch (error) {
      toast.error("Failed to create folder")
      console.error(error)
    }
  }

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Delete this project? All tasks will be deleted too.")) return

    try {
      await projectService.deleteProject(supabase, projectId)
      setProjects(projects.filter(p => p.id !== projectId))
      toast.success("Project deleted!")
      if (pathname.includes(projectId)) router.push("/dashboard")
    } catch (error) {
      toast.error("Failed to delete project")
    }
  }

  const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Delete this folder? Projects inside will be moved out (not deleted).")) return

    try {
      await folderService.deleteFolder(supabase, folderId)

      setFolders(folders.filter(f => f.id !== folderId))
      setProjects(projects.map(p => p.folder_id === folderId ? { ...p, folder_id: null } : p))
      toast.success("Folder deleted!")
    } catch (error) {
      toast.error("Failed to delete folder")
    }
  }

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const isHomeActive = pathname === "/dashboard"
  const isCalendarActive = pathname === "/dashboard/calendar"
  const isSettingsActive = pathname === "/dashboard/settings"
  const getProjectActive = (id: string) => pathname === `/dashboard/project/${id}`

  const projectsWithoutFolder = projects.filter(p => !p.folder_id)
  const getProjectsInFolder = (folderId: string) => projects.filter(p => p.folder_id === folderId)

  const renderProject = (project: Project) => (
    <div
      key={project.id}
      draggable
      onDragStart={(e) => handleDragStart(e, project.id)}
      onDragEnd={handleDragEnd}
      className={`${draggedProjectId === project.id ? "opacity-50" : ""}`}
    >
      <Link href={`/dashboard/project/${project.id}`}>
        <div
          className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-all cursor-grab active:cursor-grabbing ${getProjectActive(project.id)
            ? "bg-gradient-to-r from-purple-600/15 to-blue-600/15 text-sidebar-foreground border border-purple-500/40"
            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
        >
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
          <span className="flex-1 truncate text-sm">{project.name}</span>
          <button
            onClick={(e) => handleDeleteProject(e, project.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
          >
            <Trash2 className="w-3 h-3 text-destructive" />
          </button>
        </div>
      </Link>
    </div>
  )

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Tudoo
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Home */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-11 transition-all ${isHomeActive
              ? "bg-gradient-to-r from-purple-600/15 to-blue-600/15 text-sidebar-foreground border border-purple-500/40 shadow-sm"
              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            asChild
          >
            <span>
              <Home className="w-5 h-5" />
              Home
            </span>
          </Button>
        </Link>

        {/* Calendar */}
        <Link href="/dashboard/calendar">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-11 transition-all ${isCalendarActive
              ? "bg-gradient-to-r from-purple-600/15 to-blue-600/15 text-sidebar-foreground border border-purple-500/40 shadow-sm"
              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            asChild
          >
            <span>
              <Calendar className="w-5 h-5" />
              Calendar
            </span>
          </Button>
        </Link>

        {/* Projects Section */}
        <div className="pt-4">
          <button
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            {isProjectsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <FolderKanban className="w-4 h-4" />
            Projects
          </button>

          {isProjectsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {/* Folders */}
              {folders.map((folder) => (
                <div key={folder.id}>
                  <div
                    onDragOver={(e) => handleDragOverFolder(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropOnFolder(e, folder.id)}
                    className={`rounded-md transition-all ${dragOverFolderId === folder.id
                      ? "bg-purple-500/20 ring-2 ring-purple-500/50"
                      : ""
                      }`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleFolder(folder.id)}
                      onKeyDown={(e) => e.key === "Enter" && toggleFolder(folder.id)}
                      className="group flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-all cursor-pointer"
                    >
                      {openFolders.has(folder.id) ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <Folder className="w-4 h-4" style={{ color: folder.color }} />
                      <span className="flex-1 truncate text-left">{folder.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getProjectsInFolder(folder.id).length}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleDeleteFolder(e, folder.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleDeleteFolder(e as unknown as React.MouseEvent, folder.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </span>
                    </div>
                  </div>

                  {/* Projects in folder */}
                  {openFolders.has(folder.id) && (
                    <div className="ml-5 space-y-1">
                      {getProjectsInFolder(folder.id).map(renderProject)}
                    </div>
                  )}
                </div>
              ))}

              {/* Drop zone for removing from folder */}
              {draggedProjectId && projects.find(p => p.id === draggedProjectId)?.folder_id && (
                <div
                  onDragOver={handleDragOverRoot}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDropOnRoot}
                  className={`px-3 py-2 rounded-md border-2 border-dashed text-sm text-center transition-all ${dragOverRoot
                    ? "border-purple-500 bg-purple-500/10 text-purple-600"
                    : "border-muted-foreground/30 text-muted-foreground"
                    }`}
                >
                  Drop here to remove from folder
                </div>
              )}

              {/* Projects without folder */}
              {projectsWithoutFolder.map(renderProject)}

              {/* Add Button */}
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="text-sm">Add Project / Folder</span>
              </button>
            </div>
          )}
        </div>

        {/* Shared Projects Section */}
        {sharedProjects.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setIsSharedOpen(!isSharedOpen)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-sidebar-foreground transition-colors"
            >
              {isSharedOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Users className="w-4 h-4" />
              Shared with me
            </button>

            {isSharedOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {sharedProjects.map((project) => (
                  <Link key={project.id} href={`/dashboard/project/${project.id}`}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${getProjectActive(project.id)
                        ? "bg-gradient-to-r from-purple-600/15 to-blue-600/15 text-sidebar-foreground border border-purple-500/40"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                      <span className="flex-1 truncate text-sm">{project.name}</span>
                      <Users className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-sidebar-border space-y-2 flex-shrink-0">
        <ThemeToggle />
        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-11 transition-all ${isSettingsActive
              ? "bg-gradient-to-r from-purple-600/15 to-blue-600/15 text-sidebar-foreground border border-purple-500/40 shadow-sm"
              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            asChild
          >
            <span>
              <Settings className="w-5 h-5" />
              Settings
            </span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border transition-all"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>

      {/* Add Modal */}
      <AddItemModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmitProject={handleAddProject}
        onSubmitFolder={handleAddFolder}
        folders={folders}
      />
    </aside>
  )
}
