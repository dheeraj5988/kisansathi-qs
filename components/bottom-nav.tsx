"use client"

import { Home, MessageSquare, Camera, TrendingUp, ScrollText } from "lucide-react"
import type { ViewType } from "@/app/page"

interface BottomNavProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
}

const navItems: { id: ViewType; icon: typeof Home; label: string }[] = [
  { id: "dashboard", icon: Home, label: "Home" },
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "doctor", icon: Camera, label: "Doctor" },
  { id: "market", icon: TrendingUp, label: "Mandi" },
  { id: "schemes", icon: ScrollText, label: "Schemes" },
]

export default function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg max-w-md mx-auto">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-2 px-3 min-w-[64px] rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={`text-xs mt-1 font-medium ${isActive ? "font-bold" : ""}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
