'use client'
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Task } from "@/types"
import { taskService } from "@/lib/services/tasks"

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    useEffect(() => {
        fetchTasks()
    }, [month, year])

    const fetchTasks = async () => {
        try {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get first and last day of month for query
            const firstDay = new Date(year, month, 1).toISOString().split("T")[0]
            const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0]

            const data = await taskService.getTasksByDateRange(supabase, firstDay, lastDay)
            setTasks(data || [])
        } catch (error) {
            console.error("Failed to fetch tasks:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getDaysInMonth = () => {
        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)
        const daysInMonth = lastDayOfMonth.getDate()
        const startingDay = firstDayOfMonth.getDay()

        const days: (number | null)[] = []

        // Add empty slots for days before the first day of month
        for (let i = 0; i < startingDay; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }

        return days
    }

    const getTasksForDate = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        return tasks.filter(t => t.due_date === dateStr)
    }

    const formatDateString = (day: number) => {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }

    const isToday = (day: number) => {
        const today = new Date()
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
    const goToToday = () => setCurrentDate(new Date())

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "done": return <CheckCircle2 className="w-3 h-3 text-green-500" />
            case "in-progress": return <Clock className="w-3 h-3 text-blue-500" />
            default: return <Circle className="w-3 h-3 text-muted-foreground" />
        }
    }

    const selectedDateTasks = selectedDate
        ? tasks.filter(t => t.due_date === selectedDate)
        : []

    return (
        <div className="h-full flex flex-col bg-background">
            <header className="border-b border-border bg-card sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-card/95 flex-shrink-0">
                <div className="px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
                        <p className="text-muted-foreground mt-1">View your tasks by date</p>
                    </div>
                    <Button variant="outline" onClick={goToToday}>
                        Today
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 pb-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-foreground">
                                {monthNames[month]} {year}
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={prevMonth}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={nextMonth}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map(day => (
                                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth().map((day, index) => {
                                    if (day === null) {
                                        return <div key={`empty-${index}`} className="h-24" />
                                    }

                                    const dayTasks = getTasksForDate(day)
                                    const dateStr = formatDateString(day)
                                    const isSelected = selectedDate === dateStr

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                            className={`h-24 p-2 rounded-lg border text-left transition-all hover:bg-muted/50 ${isToday(day)
                                                ? "border-purple-500 bg-purple-500/10"
                                                : isSelected
                                                    ? "border-blue-500 bg-blue-500/10"
                                                    : "border-transparent hover:border-border"
                                                }`}
                                        >
                                            <span className={`text-sm font-medium ${isToday(day) ? "text-purple-500" : "text-foreground"
                                                }`}>
                                                {day}
                                            </span>
                                            <div className="mt-1 space-y-0.5">
                                                {dayTasks.slice(0, 2).map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="text-xs truncate px-1 py-0.5 rounded"
                                                        style={{
                                                            backgroundColor: task.project?.color ? `${task.project.color}20` : undefined,
                                                            color: task.project?.color
                                                        }}
                                                    >
                                                        {task.title}
                                                    </div>
                                                ))}
                                                {dayTasks.length > 2 && (
                                                    <div className="text-xs text-muted-foreground px-1">
                                                        +{dayTasks.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Selected Date Tasks */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-semibold text-foreground mb-4">
                            {selectedDate
                                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric"
                                })
                                : "Select a date"
                            }
                        </h3>

                        {!selectedDate ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                                    <Plus className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Click on a date to see tasks
                                </p>
                            </div>
                        ) : selectedDateTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    No tasks due on this date
                                </p>
                                <p className="text-muted-foreground text-xs mt-1">
                                    Add due dates to tasks from project pages
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedDateTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        {getStatusIcon(task.status)}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
                                                }`}>
                                                {task.title}
                                            </p>
                                            {task.project && (
                                                <Link
                                                    href={`/dashboard/project/${task.project_id}`}
                                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: task.project.color }}
                                                    />
                                                    {task.project.name}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                        💡 Tip: To add due dates to tasks, edit them from the project page. Tasks with due dates will appear on the calendar.
                    </p>
                </div>
            </div>
        </div>
    )
}
