"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/components/sidebar-provider"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle, isMobile } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isOpen ? "lg:ml-64" : "ml-0"}`}>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button variant="ghost" size="icon" onClick={toggle} className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-xl font-semibold">PEMFC Voltage Prediction</h1>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
