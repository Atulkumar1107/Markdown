"use client"

import { Button } from "@/components/ui/button"
import { TrashIcon } from "lucide-react"
import SyncStatusIndicator from "./sync-status-indicator"
import { memo } from "react"

// Memoize the component to prevent unnecessary re-renders
const NotesList = memo(function NotesList({ notes, selectedNoteId, onNoteSelect, onNoteDelete, syncStatus }) {
  if (notes.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No notes found</div>
  }

  return (
    <ul className="divide-y">
      {notes.map((note) => (
        <li key={note.id} className={`relative hover:bg-muted/50 ${selectedNoteId === note.id ? "bg-muted" : ""}`}>
          <button className="w-full text-left p-4 pr-12" onClick={() => onNoteSelect(note.id)}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{note.title || "Untitled Note"}</h3>
              <SyncStatusIndicator status={syncStatus[note.id] || "synced"} />
            </div>
            <p className="text-sm text-muted-foreground truncate mt-1">
              {note.content.substring(0, 100) || "No content"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{new Date(note.updatedAt).toLocaleString()}</p>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-3"
            onClick={(e) => {
              e.stopPropagation()
              onNoteDelete(note.id)
            }}
          >
            <TrashIcon size={16} />
          </Button>
        </li>
      ))}
    </ul>
  )
})

export default NotesList
