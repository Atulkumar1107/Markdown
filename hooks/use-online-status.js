"use client"

import { useState, useEffect } from "react"

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [forceOffline, setForceOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      if (!forceOffline) {
        setIsOnline(true)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Set initial online status
    setIsOnline(navigator.onLine && !forceOffline)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [forceOffline])

  // Effect to handle force offline changes
  useEffect(() => {
    setIsOnline(navigator.onLine && !forceOffline)
  }, [forceOffline])

  return { isOnline, setForceOffline }
}
