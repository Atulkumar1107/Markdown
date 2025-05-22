"use client"

import { useEffect } from "react"

// This is a special Next.js file that runs before the app renders
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize the mock service worker in development
    if (process.env.NODE_ENV === "development") {
      const initMocks = async () => {
        const { worker } = await import("@/lib/mocks/browser")
        worker.start({
          onUnhandledRequest: "bypass", // Don't warn about unhandled requests
        })
      }
      initMocks()
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
