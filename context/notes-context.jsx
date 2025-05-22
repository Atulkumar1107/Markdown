"use client"

import { createContext, useEffect, useState, useCallback } from "react"
import { db } from "@/lib/db"
import {
  syncNotes,
  createNote as createNoteApi,
  updateNote as updateNoteApi,
  deleteNote as deleteNoteApi,
  fetchNotes as fetchNotesApi,
} from "@/lib/api"

export const NotesContext = createContext({
  notes: [],
  addNote: async () => {},
  updateNote: async () => {},
  deleteNote: async () => {},
  syncStatus: {},
  isSyncing: false,
})

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [syncStatus, setSyncStatus] = useState({})
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [pendingSync, setPendingSync] = useState([])

  // Use useCallback for functions that are dependencies in useEffect
  const handleOnline = useCallback(() => setIsOnline(true), [])
  const handleOffline = useCallback(() => setIsOnline(false), [])

  // Load notes from IndexedDB on initial load
  useEffect(() => {
    const loadNotes = async () => {
      try {
        // First load from IndexedDB
        const storedNotes = await db.notes.toArray()
        setNotes(storedNotes)

        // Initialize sync status for all notes
        const initialSyncStatus = {}
        storedNotes.forEach((note) => {
          initialSyncStatus[note.id] = note.synced ? "synced" : "unsynced"
        })
        setSyncStatus(initialSyncStatus)

        // Find notes that need to be synced
        const unsyncedNotes = storedNotes.filter((note) => !note.synced)
        if (unsyncedNotes.length > 0) {
          setPendingSync(unsyncedNotes.map((note) => note.id))
        }

        // If we're online, also try to fetch from API and merge
        if (navigator.onLine) {
          try {
            const apiNotes = await fetchNotesApi()
            console.log("Fetched notes from API:", apiNotes)

            // Merge API notes with local notes
            if (apiNotes && apiNotes.length > 0) {
              // For each API note, check if it exists locally
              const notesToAdd = []
              for (const apiNote of apiNotes) {
                const localNote = storedNotes.find((note) => note.id === apiNote.id)
                if (!localNote) {
                  // If not in local DB, add it
                  await db.notes.add({
                    ...apiNote,
                    synced: true,
                    syncAttempted: true,
                  })

                  // Collect notes to add to state
                  notesToAdd.push({
                    ...apiNote,
                    synced: true,
                    syncAttempted: true,
                  })
                }
              }

              // Update state once with all new notes
              if (notesToAdd.length > 0) {
                setNotes((prev) => [...prev, ...notesToAdd])

                // Update sync status
                const newSyncStatus = { ...initialSyncStatus }
                notesToAdd.forEach((note) => {
                  newSyncStatus[note.id] = "synced"
                })
                setSyncStatus(newSyncStatus)
              }
            }
          } catch (error) {
            console.error("Failed to fetch notes from API:", error)
          }
        }

        setInitialized(true)
      } catch (error) {
        console.error("Failed to load notes from IndexedDB:", error)
      }
    }

    loadNotes()
  }, [])

  // Handle online/offline status
  useEffect(() => {
    // Set initial online status
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine)
    }

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  // Sync notes when online - with proper dependency array
  useEffect(() => {
    if (!isOnline || !initialized || pendingSync.length === 0) {
      return
    }

    const syncUnsyncedNotes = async () => {
      setIsSyncing(true)

      try {
        // Get all unsynced notes
        const unsyncedNotes = notes.filter((note) => pendingSync.includes(note.id))

        // Update sync status to "syncing" for all unsynced notes
        const updatedSyncStatus = { ...syncStatus }
        unsyncedNotes.forEach((note) => {
          updatedSyncStatus[note.id] = "syncing"
        })
        setSyncStatus(updatedSyncStatus)

        // Mark notes as having sync attempted
        const notesWithSyncAttempt = unsyncedNotes.map((note) => ({
          ...note,
          syncAttempted: true,
        }))

        // Sync notes with the backend
        const syncResults = await syncNotes(notesWithSyncAttempt)

        // Update local notes and sync status based on sync results
        const newSyncStatus = { ...updatedSyncStatus }
        const updatedNotes = [...notes]
        const newPendingSync = [...pendingSync]

        for (const result of syncResults) {
          const { id, success } = result

          if (success) {
            // Update note's synced status in local state
            const noteIndex = updatedNotes.findIndex((note) => note.id === id)
            if (noteIndex !== -1) {
              updatedNotes[noteIndex] = {
                ...updatedNotes[noteIndex],
                synced: true,
                syncAttempted: true,
              }

              // Also update in IndexedDB
              await db.notes.update(id, { synced: true, syncAttempted: true })
            }

            newSyncStatus[id] = "synced"

            // Remove from pending sync
            const syncIndex = newPendingSync.indexOf(id)
            if (syncIndex !== -1) {
              newPendingSync.splice(syncIndex, 1)
            }
          } else {
            newSyncStatus[id] = "error"
          }
        }

        setNotes(updatedNotes)
        setSyncStatus(newSyncStatus)
        setPendingSync(newPendingSync)
      } catch (error) {
        console.error("Failed to sync notes:", error)

        // Mark all as error
        const errorSyncStatus = { ...syncStatus }
        pendingSync.forEach((id) => {
          errorSyncStatus[id] = "error"
        })
        setSyncStatus(errorSyncStatus)
      } finally {
        setIsSyncing(false)
      }
    }

    syncUnsyncedNotes()
  }, [isOnline, initialized, pendingSync.length])

  // Use useCallback for functions passed to child components
  const addNote = useCallback(
    async (note) => {
      try {
        // Add to IndexedDB
        await db.notes.add({
          ...note,
          syncAttempted: false,
        })

        // Update local state
        setNotes((prevNotes) => [...prevNotes, { ...note, syncAttempted: false }])

        // Update sync status
        setSyncStatus((prevStatus) => ({
          ...prevStatus,
          [note.id]: "unsynced",
        }))

        // Add to pending sync
        setPendingSync((prev) => [...prev, note.id])

        // If online, try to sync immediately
        if (isOnline) {
          try {
            setSyncStatus((prevStatus) => ({
              ...prevStatus,
              [note.id]: "syncing",
            }))

            await createNoteApi(note)

            // Update synced status
            await db.notes.update(note.id, { synced: true, syncAttempted: true })
            setNotes((prevNotes) =>
              prevNotes.map((n) => (n.id === note.id ? { ...n, synced: true, syncAttempted: true } : n)),
            )
            setSyncStatus((prevStatus) => ({
              ...prevStatus,
              [note.id]: "synced",
            }))
            setPendingSync((prev) => prev.filter((id) => id !== note.id))
          } catch (error) {
            console.error("Failed to sync new note:", error)
            setSyncStatus((prevStatus) => ({
              ...prevStatus,
              [note.id]: "error",
            }))
          }
        }
      } catch (error) {
        console.error("Failed to add note:", error)
      }
    },
    [isOnline],
  )

  const updateNote = useCallback(
    async (updatedNote) => {
      try {
        // Update in IndexedDB
        await db.notes.update(updatedNote.id, { ...updatedNote, synced: false, syncAttempted: false })

        // Update local state
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === updatedNote.id ? { ...updatedNote, synced: false, syncAttempted: false } : note,
          ),
        )

        // Update sync status
        setSyncStatus((prevStatus) => ({
          ...prevStatus,
          [updatedNote.id]: "unsynced",
        }))

        // Add to pending sync if not already there
        setPendingSync((prev) => {
          if (prev.includes(updatedNote.id)) {
            return prev
          }
          return [...prev, updatedNote.id]
        })

        // If online, try to sync immediately
        if (isOnline) {
          try {
            setSyncStatus((prevStatus) => ({
              ...prevStatus,
              [updatedNote.id]: "syncing",
            }))

            await updateNoteApi(updatedNote)

            // Update synced status
            await db.notes.update(updatedNote.id, { synced: true, syncAttempted: true })
            setNotes((prevNotes) =>
              prevNotes.map((n) => (n.id === updatedNote.id ? { ...n, synced: true, syncAttempted: true } : n)),
            )
            setSyncStatus((prevStatus) => ({
              ...prevStatus,
              [updatedNote.id]: "synced",
            }))
            setPendingSync((prev) => prev.filter((id) => id !== updatedNote.id))
          } catch (error) {
            console.error("Failed to sync updated note:", error)
            setSyncStatus((prevStatus) => ({
              ...prevStatus,
              [updatedNote.id]: "error",
            }))
          }
        }
      } catch (error) {
        console.error("Failed to update note:", error)
      }
    },
    [isOnline],
  )

  const deleteNote = useCallback(
    async (id) => {
      try {
        // Delete from IndexedDB
        await db.notes.delete(id)

        // Update local state
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))

        // Remove from sync status
        setSyncStatus((prevStatus) => {
          const newStatus = { ...prevStatus }
          delete newStatus[id]
          return newStatus
        })

        // Remove from pending sync
        setPendingSync((prev) => prev.filter((syncId) => syncId !== id))

        // If we're online, we should also delete from the backend
        if (isOnline) {
          try {
            // Even if the delete API call fails with 404, we consider it a success
            // since the note is already gone from our local storage
            await deleteNoteApi(id).catch((error) => {
              // If it's a 404, that's fine - the note doesn't exist on the server
              if (error.message.includes("404")) {
                console.log(`Note with id ${id} not found on server, already deleted or never synced`)
                return { success: true }
              }
              throw error
            })
          } catch (error) {
            console.error("Failed to delete note from backend:", error)
            // We don't need to handle this error in the UI since the note is already gone locally
          }
        }
      } catch (error) {
        console.error("Failed to delete note:", error)
      }
    },
    [isOnline],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    notes,
    addNote,
    updateNote,
    deleteNote,
    syncStatus,
    isSyncing,
  }

  return <NotesContext.Provider value={contextValue}>{children}</NotesContext.Provider>
}
