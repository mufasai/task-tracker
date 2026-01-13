"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Trash2, Edit2, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface TaskCardProps {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "done"
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: "todo" | "in-progress" | "done") => void
}

const statusColors = {
  todo: "bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/40 hover:border-purple-300 dark:hover:border-purple-700/50 hover:shadow-md hover:shadow-purple-500/10",
  "in-progress": "bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40 hover:border-blue-300 dark:hover:border-blue-700/50 hover:shadow-md hover:shadow-blue-500/10",
  done: "bg-green-50/70 dark:bg-green-950/20 border-green-200 dark:border-green-800/40 hover:border-green-300 dark:hover:border-green-700/50 hover:shadow-md hover:shadow-green-500/10",
}

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
}

export function TaskCard({ id, title, description, status, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const getNextStatus = (): "todo" | "in-progress" | "done" => {
    switch (status) {
      case "todo":
        return "in-progress"
      case "in-progress":
        return "done"
      case "done":
        return "todo"
      default:
        return "todo"
    }
  }

  const handleStatusClick = () => {
    const nextStatus = getNextStatus()
    onStatusChange(id, nextStatus)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 border-2 ${statusColors[status]} transition-all duration-200`}>
        <div className="flex items-start gap-4">
          <button
            onClick={handleStatusClick}
            className="mt-1 flex-shrink-0 group"
            title={`Click to mark as ${getNextStatus()}`}
          >
            {status === "todo" && (
              <Circle className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
            )}
            {status === "in-progress" && (
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors animate-pulse" />
            )}
            {status === "done" && (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-foreground ${status === "done" ? "line-through text-muted-foreground" : ""}`}
            >
              {title}
            </h3>
            {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
            <div className="mt-2">
              <span
                className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${
                  status === "todo"
                    ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50"
                    : status === "in-progress"
                      ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50"
                      : "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50"
                }`}
              >
                {statusLabels[status]}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onEdit(id)}
              className="hover:bg-muted/80 h-8 w-8 p-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete(id)}
              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}