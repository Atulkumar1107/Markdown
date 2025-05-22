"use client"

import { useEffect, useState, useMemo } from "react"
import { useNotes } from "@/hooks/use-notes"
import { useOnlineStatus } from "@/hooks/use-online-status"
import NotesList from "@/components/notes-list"
import NoteEditor from "@/components/note-editor"
import { Button } from "@/components/ui/button"
import { PlusIcon, WifiIcon, WifiOffIcon } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import SearchBar from "@/components/search-bar"
import ApiTestControls from "@/components/api-test-controls"

export default function NotesApp() {
  // Use state to track client-side rendering
  const [isClient, setIsClient] = useState(false)
  const { notes, addNote, updateNote, deleteNote, syncStatus, isSyncing } = useNotes()
  const { isOnline, setForceOffline } = useOnlineStatus()
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Set isClient to true on mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoize filtered and sorted notes to prevent unnecessary recalculations
  const filteredAndSortedNotes = useMemo(() => {
    if (!isClient) return []

    const filtered = searchQuery
      ? notes.filter(
          (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : notes

    // Sort notes by updatedAt (most recent first)
    return [...filtered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [isClient, notes, searchQuery])

  // Memoize selected note to prevent unnecessary lookups
  const selectedNote = useMemo(() => {
    if (!isClient || !selectedNoteId) return null
    return notes.find((note) => note.id === selectedNoteId)
  }, [isClient, selectedNoteId, notes])

  const handleCreateNewNote = () => {
    const newNote = {
      id: uuidv4(),
      title: "Untitled Note",
      content: "",
      updatedAt: new Date().toISOString(),
      synced: false,
    }

    addNote(newNote)
    setSelectedNoteId(newNote.id)
  }

  const handleNoteSelect = (noteId) => {
    setSelectedNoteId(noteId)
  }

  const handleNoteUpdate = (updatedNote) => {
    updateNote(updatedNote)
  }

  const handleNoteDelete = (noteId) => {
    deleteNote(noteId)
    if (selectedNoteId === noteId) {
      setSelectedNoteId(filteredAndSortedNotes.length > 1 ? filteredAndSortedNotes[0].id : null)
    }
  }

  const handleSimulateError = (errorRate) => {
    // Apply the error rate to the mock API
    window.sessionStorage.setItem("msw-error-rate", errorRate.toString())
  }

  const handleSimulateDelay = (delayMs) => {
    // Apply the delay to the mock API
    window.sessionStorage.setItem("msw-delay", delayMs.toString())
  }

  const handleToggleOffline = (forceOffline) => {
    setForceOffline(forceOffline)
  }

  // Select the first note by default if none is selected
  useEffect(() => {
    if (isClient && !selectedNoteId && filteredAndSortedNotes.length > 0) {
      setSelectedNoteId(filteredAndSortedNotes[0].id)
    }
  }, [isClient, selectedNoteId, filteredAndSortedNotes])

  // If not client-side yet, show a simple loading state
  if (!isClient) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold">Notes</h1>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <WifiIcon size={18} className="text-green-500" />
            ) : (
              <WifiOffIcon size={18} className="text-red-500" />
            )}
            <Button size="sm" onClick={handleCreateNewNote}>
              <PlusIcon size={16} className="mr-1" /> New
            </Button>
          </div>
        </div>
        <div className="p-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex-1 overflow-auto">
          <NotesList
            notes={filteredAndSortedNotes}
            selectedNoteId={selectedNoteId}
            onNoteSelect={handleNoteSelect}
            onNoteDelete={handleNoteDelete}
            syncStatus={syncStatus}
          />
        </div>
        <div className="p-2 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isSyncing ? <span>Syncing changes...</span> : <span>{isOnline ? "Connected" : "Offline"}</span>}
          </span>
          <ApiTestControls
            onSimulateError={handleSimulateError}
            onSimulateDelay={handleSimulateDelay}
            onToggleOffline={handleToggleOffline}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {selectedNote ? (
          <NoteEditor note={selectedNote} onNoteUpdate={handleNoteUpdate} syncStatus={syncStatus[selectedNote.id]} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p>No note selected</p>
              <Button variant="outline" className="mt-4" onClick={handleCreateNewNote}>
                Create a new note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
