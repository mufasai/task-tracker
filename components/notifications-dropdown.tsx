"use client"

import { useEffect, useState } from "react"
import { Bell, Check, Trash2, UserPlus, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Notification } from "@/types"
import { notificationService, collaborationService } from "@/lib/services/collaboration"

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchNotifications()

        // Subscribe to new notifications
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${(async () => (await supabase.auth.getUser()).data.user?.id)()}` // Note: This filter might need adjustment as filter string needs actual ID. 
                // For Client side subscription, usually we need user ID first.
            }, () => {
                fetchNotifications()
                toast.info("New notification received")
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const data = await notificationService.getNotifications(supabase, user.id)
            setNotifications(data || [])
            setUnreadCount(data?.filter(n => !n.is_read).length || 0)
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(supabase, id)
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark as read:", error)
        }
    }

    const markAllRead = async () => {
        try {
            const { data: { user } = {} } = await supabase.auth.getUser()
            if (!user) return

            await notificationService.markAllAsRead(supabase, user.id)
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
            toast.success("All marked as read")
        } catch (error) {
            toast.error("Failed to mark all as read")
        }
    }

    const deleteNotification = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        try {
            await notificationService.deleteNotification(supabase, id)
            setNotifications(notifications.filter(n => n.id !== id))
            setUnreadCount(prev => {
                const notification = notifications.find(n => n.id === id)
                return notification && !notification.is_read ? Math.max(0, prev - 1) : prev
            })
            toast.success("Notification removed")
        } catch (error) {
            toast.error("Failed to remove notification")
        }
    }

    const handleAcceptInvite = async (notification: Notification) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Update collaborator status
            const { error } = await supabase
                .from("collaborators")
                .update({ status: "accepted" })
                .eq("project_id", notification.data.project_id)
                .eq("user_id", user.id)

            if (error) throw error

            toast.success("Invitation accepted!")
            await deleteNotification(notification.id)
            router.push(`/dashboard/project/${notification.data.project_id}`)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to accept invitation")
        }
    }

    const handleRejectInvite = async (notification: Notification) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            await supabase
                .from("collaborators")
                .delete()
                .eq("project_id", notification.data.project_id)
                .eq("user_id", user?.id)

            toast.success("Invitation declined")
            await deleteNotification(notification.id)
        } catch (error) {
            toast.error("Failed to decline invitation")
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Just now"
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7">
                            Mark all read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-muted/50 transition-colors ${!notification.is_read ? "bg-purple-500/5" : ""
                                    }`}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === "invite"
                                        ? "bg-purple-500/10 text-purple-500"
                                        : "bg-blue-500/10 text-blue-500"
                                        }`}>
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatTime(notification.created_at)}
                                        </p>

                                        {/* Action buttons for invites */}
                                        {notification.type === "invite" && (
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleAcceptInvite(notification)
                                                    }}
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRejectInvite(notification)
                                                    }}
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Decline
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteNotification(notification.id)
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
