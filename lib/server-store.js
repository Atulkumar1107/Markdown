// A simple in-memory store that can be shared between API routes
// This is a workaround for sharing data between route handlers in Next.js App Router

// In-memory store for our mock API
export const notes = []

// Debug function to log the current state of notes
export const logNotesState = () => {
  console.log(`API: Current notes state: ${notes.length} notes`)
  notes.forEach((note) => {
    console.log(`  - ${note.id}: ${note.title}`)
  })
}
