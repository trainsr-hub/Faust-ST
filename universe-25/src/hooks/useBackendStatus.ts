// Hook to check backend connection status
import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'http://localhost:8080'

export function useBackendStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkStatus = useCallback(async () => {
    setIsChecking(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${API_BASE}/openapi.json`, {
        method: 'GET',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      setIsOnline(response.ok)
    } catch (error) {
      setIsOnline(false)
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [checkStatus])

  return { isOnline, isChecking, checkStatus }
}
