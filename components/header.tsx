"use client"

import { Button } from "@/components/ui/button"
import { Plus, UserPlus } from "lucide-react"
import { NotificationsDropdown } from "./notifications-dropdown"

interface HeaderProps {
  onAddTask?: () => void
  onInvite?: () => void
  title?: string
  subtitle?: string
  showAddTask?: boolean
  showInvite?: boolean
}

export function Header({
  onAddTask,
  onInvite,
  title = "My Tasks",
  subtitle = "Organize and track your work",
  showAddTask = true,
  showInvite = false
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-card/95 flex-shrink-0">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationsDropdown />

          {showInvite && onInvite && (
            <Button
              onClick={onInvite}
              variant="outline"
              className="gap-2 h-11"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
          )}

          {showAddTask && onAddTask && (
            <Button
              onClick={onAddTask}
              className="gap-2 h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
