"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Folder, FileText } from "lucide-react"

const PROJECT_COLORS = [
    "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
    "#EF4444", "#EC4899", "#06B6D4", "#84CC16",
]

const FOLDER_COLORS = [
    "#6B7280", "#8B5CF6", "#3B82F6", "#10B981",
    "#F59E0B", "#EF4444", "#EC4899", "#06B6D4",
]

interface Folder {
    id: string
    name: string
}

interface AddItemModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmitProject: (name: string, color: string, folderId: string | null) => void
    onSubmitFolder: (name: string, color: string) => void
    folders: Folder[]
}

type ItemType = "project" | "folder"

export function AddItemModal({ open, onOpenChange, onSubmitProject, onSubmitFolder, folders }: AddItemModalProps) {
    const [itemType, setItemType] = useState<ItemType>("project")
    const [name, setName] = useState("")
    const [color, setColor] = useState(PROJECT_COLORS[0])
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        if (itemType === "project") {
            onSubmitProject(name.trim(), color, selectedFolderId)
        } else {
            onSubmitFolder(name.trim(), color)
        }

        resetForm()
        onOpenChange(false)
    }

    const resetForm = () => {
        setName("")
        setColor(PROJECT_COLORS[0])
        setSelectedFolderId(null)
        setItemType("project")
    }

    const colors = itemType === "project" ? PROJECT_COLORS : FOLDER_COLORS

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) resetForm()
            onOpenChange(isOpen)
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>

                {/* Type Selector */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                        type="button"
                        onClick={() => {
                            setItemType("project")
                            setColor(PROJECT_COLORS[0])
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${itemType === "project"
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Project
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setItemType("folder")
                            setColor(FOLDER_COLORS[0])
                            setSelectedFolderId(null)
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${itemType === "folder"
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Folder className="w-4 h-4" />
                        Folder
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="item-name">{itemType === "project" ? "Project" : "Folder"} Name</Label>
                        <Input
                            id="item-name"
                            placeholder={`Enter ${itemType} name...`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Folder selector - only for projects */}
                    {itemType === "project" && folders.length > 0 && (
                        <div className="space-y-2">
                            <Label>Folder (Optional)</Label>
                            <select
                                value={selectedFolderId || ""}
                                onChange={(e) => setSelectedFolderId(e.target.value || null)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">No folder</option>
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2 flex-wrap">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : ""
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim()}>
                            Create {itemType === "project" ? "Project" : "Folder"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
