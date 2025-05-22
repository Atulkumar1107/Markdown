import { NextResponse } from "next/server"
import { notes, logNotesState } from "@/lib/server-store"

export async function GET() {
  console.log("API: GET /api/notes")
  logNotesState()
  return NextResponse.json(notes)
}

export async function POST(request) {
  console.log("API: POST /api/notes")

  try {
    const note = await request.json()

    // Ensure the note has all required fields
    if (!note.id || note.title === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if note already exists (to prevent duplicates)
    const existingIndex = notes.findIndex((n) => n.id === note.id)
    if (existingIndex >= 0) {
      // Update existing note instead of creating a duplicate
      notes[existingIndex] = { ...notes[existingIndex], ...note }
      console.log(`API: Updated existing note with id ${note.id}`)
      logNotesState()
      return NextResponse.json(notes[existingIndex], { status: 200 })
    }

    // Add the note to our in-memory store
    notes.push(note)
    console.log(`API: Created note with id ${note.id}`)
    logNotesState()

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("API: Error in POST /api/notes:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
