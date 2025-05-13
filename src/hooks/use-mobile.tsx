
import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768 // px

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Setup vh CSS variable for mobile browsers
    const setVhVariable = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    
    // Initial setup
    setVhVariable()
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Debounced resize handler
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    
    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        setVhVariable()
      }, 100)
    }
    
    // Add event listeners
    window.addEventListener("resize", handleResize)
    mql.addEventListener("change", handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      mql.removeEventListener("change", handleResize)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return isMobile
}
