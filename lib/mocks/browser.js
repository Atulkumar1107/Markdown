// This file is only used in the browser
let worker = null

// Only setup the worker in a browser environment
if (typeof window !== "undefined") {
  const setupWorker = async () => {
    try {
      const { setupWorker } = await import("msw")
      const { handlers } = await import("./handlers")
      worker = setupWorker(...handlers)
    } catch (error) {
      console.error("Failed to setup MSW worker:", error)
    }
  }

  // Setup the worker
  setupWorker()
}

export { worker }
