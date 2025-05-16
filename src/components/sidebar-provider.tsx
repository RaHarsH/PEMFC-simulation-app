"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  isMobile: false,
})

export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  const toggle = () => setIsOpen(!isOpen)

  return <SidebarContext.Provider value={{ isOpen, toggle, isMobile }}>{children}</SidebarContext.Provider>
}
