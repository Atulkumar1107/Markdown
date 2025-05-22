import { http, HttpResponse } from "msw"

// In-memory store for our mock data
const notes = []

// Helper to get error rate and delay from session storage
const getErrorRate = () => {
  if (typeof window === "undefined") return 0
  return Number.parseInt(window.sessionStorage.getItem("msw-error-rate") || "0", 10)
}

const getDelay = () => {
  if (typeof window === "undefined") return 0
  return Number.parseInt(window.sessionStorage.getItem("msw-delay") || "0", 10)
}

// Helper to determine if a request should fail based on error rate
const shouldFail = () => {
  const errorRate = getErrorRate()
  return Math.random() * 100 < errorRate
}

// Helper to add delay to responses
const addDelay = async () => {
  const delay = getDelay()
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

export const handlers = [
  // GET /api/notes - Get all notes
  http.get("/api/notes", async () => {
    console.log("MSW: Handling GET /api/notes")

    await addDelay()

    // Check if we should simulate an error
    if (shouldFail()) {
      console.log("MSW: Simulating error for GET /api/notes")
      return HttpResponse.json(
        { error: "Simulated server error" },
        { status: 500 }
      )
    }

    return HttpResponse.json(notes)
  }),

  // POST /api/notes - Create a new note
  http.post("/api/notes", async ({ request }) => {
    console.log("MSW: Handling POST /api/notes")

    await addDelay()

    // Check if we should simulate an error
    if (shouldFail()) {
      console.log("MSW: Simulating error for POST /api/notes")
      return HttpResponse.json(
        { error: "Simulated server error" },
        { status: 500 }
      )
    }

    try {
      const note = await request.json()

      // Ensure the note has all required fields
      if (!note.id || !note.title || !note.updatedAt) {
        return HttpResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      // Add the note to our store
      notes.push(note)
      console.log(`MSW: Created note with id ${note.id}`)

      return HttpResponse.json(note, { status: 201 })
    } catch (error) {
      console.error("MSW: Error in POST /api/notes", error)
      return HttpResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }
  }),

  // GET /api/notes/:id - Get a specific note
  http.get("/api/notes/:id", async ({ params }) => {
    console.log(`MSW: Handling GET /api/notes/${params.id}`)

    await addDelay()

    // Check if we should simulate an error
    if (shouldFail()) {
      console.log(`MSW: Simulating error for GET /api/notes/${params.id}`)
      return HttpResponse.json(
        { error: "Simulated server error" },
        { status: 500 }
      )
    }

    const { id } = params
    const note = notes.find((note) => note.id === id)

    if (!note) {
      console.log(`MSW: Note with id ${id} not found`)
      return HttpResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }

    return HttpResponse.json(note)
  }),

  // PUT /api/notes/:id - Update a note
  http.put("/api/notes/:id", async ({ params, request }) => {
    console.log(`MSW: Handling PUT /api/notes/${params.id}`)

    await addDelay()

    // Check if we should simulate an error
    if (shouldFail()) {
      console.log(`MSW: Simulating error for PUT /api/notes/${params.id}`)
      return HttpResponse.json(
        { error: "Simulated server error" },
        { status: 500 }
      )
    }

    try {
      const { id } = params
      const updatedNote = await request.json()
      const index = notes.findIndex((note) => note.id === id)

      if (index === -1) {
        console.log(`MSW: Note with id ${id} not found for update`)
        return HttpResponse.json(
          { error: "Note not found" },
          { status: 404 }
        )
      }

      // Update the note
      notes[index] = { ...notes[index], ...updatedNote }
      console.log(`MSW: Updated note with id ${id}`)

      return HttpResponse.json(notes[index])
    } catch (error) {
      console.error(`MSW: Error in PUT /api/notes/${params.id}`, error)
      return HttpResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }
  }),

  // DELETE /api/notes/:id - Delete a note
  http.delete("/api/notes/:id", async ({ params }) => {
    console.log(`MSW: Handling DELETE /api/notes/${params.id}`)

    await addDelay()

    // Check if we should simulate an error
    if (shouldFail()) {
      console.log(`MSW: Simulating error for DELETE /api/notes/${params.id}`)
      return HttpResponse.json(
        { error: "Simulated server error" },
        { status: 500 }
      )
    }

    const { id } = params
    const index = notes.findIndex((note) => note.id === id)

    if (index === -1) {
      console.log(`MSW: Note with id ${id} not found for deletion`)
      return HttpResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }

    // Remove the note
    notes.splice(index, 1)
    console.log(`MSW: Deleted note with id ${id}`)

    return HttpResponse.json({ success: true })
  }),
]