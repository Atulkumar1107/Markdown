import { NextResponse } from "next/server"
import { notes, logNotesState } from "@/lib/server-store"

export async function GET(request, { params }) {
  // Await params to fix the error
  const { id } = await params
  console.log(`API: GET /api/notes/${id}`)
  logNotesState()

  const note = notes.find((note) => note.id === id)

  if (!note) {
    console.log(`API: Note with id ${id} not found`)
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
  }

  return NextResponse.json(note)
}

export async function PUT(request, { params }) {
  // Await params to fix the error
  const { id } = await params
  console.log(`API: PUT /api/notes/${id}`)
  logNotesState()

  try {
    const updatedNote = await request.json()

    const index = notes.findIndex((note) => note.id === id)

    if (index === -1) {
      console.log(`API: Note with id ${id} not found for update`)

      // If note doesn't exist, create it instead of returning 404
      notes.push({ ...updatedNote, id })
      console.log(`API: Created note with id ${id} during PUT operation`)
      logNotesState()

      return NextResponse.json(updatedNote)
    }

    // Update the note
    notes[index] = { ...notes[index], ...updatedNote }
    console.log(`API: Updated note with id ${id}`)
    logNotesState()

    return NextResponse.json(notes[index])
  } catch (error) {
    console.error(`API: Error in PUT /api/notes/${id}:`, error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  // Await params to fix the error
  const { id } = await params
  console.log(`API: DELETE /api/notes/${id}`)
  logNotesState()

  const index = notes.findIndex((note) => note.id === id)

  if (index === -1) {
    console.log(`API: Note with id ${id} not found for deletion`)
    // Return success even if note doesn't exist
    return NextResponse.json({ success: true })
  }

  // Remove the note
  notes.splice(index, 1)
  console.log(`API: Deleted note with id ${id}`)
  logNotesState()

  return NextResponse.json({ success: true })
}
