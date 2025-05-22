"use client"

import { useEffect, useState, memo } from "react"
import { Input } from "@/components/ui/input"
import MDEditor from "@uiw/react-md-editor"
import { debounce } from "@/lib/utils"
import SyncStatusIndicator from "./sync-status-indicator"

// Memoize the component to prevent unnecessary re-renders
const NoteEditor = memo(function NoteEditor({ note, onNoteUpdate, syncStatus }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)

  // Update local state when the selected note changes
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note.id, note.title, note.content])

  // Debounced update function to avoid too many updates
  const debouncedUpdate = debounce((updatedNote) => {
    onNoteUpdate(updatedNote)
  }, 500)

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)

    const updatedNote = {
      ...note,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      synced: false,
    }

    debouncedUpdate(updatedNote)
  }

  const handleContentChange = (value) => {
    const newContent = value || ""
    setContent(newContent)

    const updatedNote = {
      ...note,
      content: newContent,
      updatedAt: new Date().toISOString(),
      synced: false,
    }

    debouncedUpdate(updatedNote)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="text-lg font-medium border-none shadow-none focus-visible:ring-0"
        />
        <SyncStatusIndicator status={syncStatus || "synced"} showLabel />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <MDEditor value={content} onChange={handleContentChange} preview="edit" height="100%" className="border-none" />
      </div>
    </div>
  )
})

export default NoteEditor
