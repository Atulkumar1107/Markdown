// API URL for our mock endpoints
const API_URL = "/api/notes"

// Helper function to log API calls
const logApiCall = (method, url, data = null) => {
  console.log(`API Client: ${method} ${url}${data ? " with data" : ""}`)
  if (data) {
    console.log("Data:", JSON.stringify(data).substring(0, 100) + (JSON.stringify(data).length > 100 ? "..." : ""))
  }
}

// Function to sync notes with the backend
export async function syncNotes(notes) {
  const results = []

  for (const note of notes) {
    try {
      // For each note, perform the appropriate API call
      let response

      if (note.deleted) {
        // Handle deleted notes
        logApiCall("DELETE", `${API_URL}/${note.id}`)
        response = await fetch(`${API_URL}/${note.id}`, {
          method: "DELETE",
        })
      } else {
        // Handle new or updated notes
        // For new notes, use POST
        if (!note.synced && !note.syncAttempted) {
          logApiCall("POST", API_URL, note)
          response = await fetch(`${API_URL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
          })
        } else {
          // For existing notes, use PUT
          logApiCall("PUT", `${API_URL}/${note.id}`, note)
          response = await fetch(`${API_URL}/${note.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
          })
        }
      }

      // Check if the request was successful
      const success = response.ok

      if (!success) {
        const errorText = await response.text()
        console.error(`API Client: Request failed with status ${response.status}: ${errorText}`)
      }

      results.push({ id: note.id, success })
    } catch (error) {
      console.error(`API Client: Failed to sync note ${note.id}:`, error)
      results.push({ id: note.id, success: false, error: error.message })
    }
  }

  return results
}

// Function to fetch all notes from the backend
export async function fetchNotes() {
  try {
    logApiCall("GET", API_URL)
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("API Client: Error fetching notes:", error)
    throw error
  }
}

// Function to create a note on the backend
export async function createNote(note) {
  try {
    logApiCall("POST", API_URL, note)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create note: ${response.status} - ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("API Client: Error creating note:", error)
    throw error
  }
}

// Function to update a note on the backend
export async function updateNote(note) {
  try {
    logApiCall("PUT", `${API_URL}/${note.id}`, note)
    const response = await fetch(`${API_URL}/${note.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update note: ${response.status} - ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("API Client: Error updating note:", error)
    throw error
  }
}

// Function to delete a note from the backend
export async function deleteNote(id) {
  try {
    logApiCall("DELETE", `${API_URL}/${id}`)
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })

    // If the response is 404, we'll consider it a success
    // This is because the note might not exist on the server yet
    if (response.status === 404) {
      console.log(`API Client: Note with id ${id} not found on server, considering delete successful`)
      return true
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete note: ${response.status} - ${errorText}`)
    }
    return true
  } catch (error) {
    console.error("API Client: Error deleting note:", error)
    throw error
  }
}
