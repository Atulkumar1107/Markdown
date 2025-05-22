import Dexie from "dexie"

class NotesDatabase extends Dexie {
  constructor() {
    super("NotesDatabase")
    this.version(1).stores({
      notes: "id, title, updatedAt, synced",
    })
  }
}

export const db = new NotesDatabase()
