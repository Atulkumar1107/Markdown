"use client"

import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { NotesProvider } from "@/context/notes-context"

export function Providers({ children }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Initialize the mock service worker in development
    if (process.env.NODE_ENV === "development") {
      const initMocks = async () => {
        try {
          if (typeof window !== "undefined") {
            console.log("Initializing MSW...")

            // Disable MSW if we're using the real API routes
            const useMockApi = false

            if (useMockApi) {
              const { worker } = await import("@/lib/mocks/browser")
              if (worker) {
                await worker.start({
                  onUnhandledRequest: "bypass", // Don't warn about unhandled requests
                })
                console.log("MSW initialized successfully")
              }
            } else {
              console.log("Using real API routes instead of MSW")
            }
          }
        } catch (error) {
          console.error("Error starting MSW:", error)
        }
      }
      initMocks()
    }

    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Return a minimal loading state or null
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NotesProvider>{children}</NotesProvider>
    </ThemeProvider>
  )
}
