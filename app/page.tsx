"use client"

import { useState } from "react"
import OnboardingView from "@/components/onboarding-view"
import DashboardView from "@/components/dashboard-view"
import ChatView from "@/components/chat-view"
import CropDoctorView from "@/components/crop-doctor-view"
import MarketView from "@/components/market-view"
import SchemesView from "@/components/schemes-view"
import BottomNav from "@/components/bottom-nav"

export type ViewType = "onboarding" | "dashboard" | "chat" | "doctor" | "market" | "schemes"
export type LanguageType = "en" | "ta" | "te" | "kn" | "hi"

export default function KisanSathiApp() {
  const [currentView, setCurrentView] = useState<ViewType>("onboarding")
  const [language, setLanguage] = useState<LanguageType>("en")
  const [farmerName, setFarmerName] = useState("Ramesh")

  const translations: Record<LanguageType, { greeting: string; tapToSpeak: string; askAbout: string }> = {
    en: { greeting: "Namaste", tapToSpeak: "Tap to Speak", askAbout: "Ask about crops, pests, or weather" },
    ta: { greeting: "வணக்கம்", tapToSpeak: "பேச தட்டவும்", askAbout: "பயிர்கள், பூச்சிகள் அல்லது வானிலை பற்றி கேளுங்கள்" },
    te: { greeting: "నమస్కారం", tapToSpeak: "మాట్లాడటానికి నొక్కండి", askAbout: "పంటలు, చీడపురుగులు లేదా వాతావరణం గురించి అడగండి" },
    kn: { greeting: "ನಮಸ್ಕಾರ", tapToSpeak: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ", askAbout: "ಬೆಳೆಗಳು, ಕೀಟಗಳು ಅಥವಾ ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಿ" },
    hi: { greeting: "नमस्ते", tapToSpeak: "बोलने के लिए टैप करें", askAbout: "फसलों, कीटों या मौसम के बारे में पूछें" },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {currentView === "onboarding" && (
        <OnboardingView language={language} setLanguage={setLanguage} onComplete={() => setCurrentView("dashboard")} />
      )}

      {currentView === "dashboard" && (
        <DashboardView farmerName={farmerName} translations={translations[language]} setCurrentView={setCurrentView} />
      )}

      {currentView === "chat" && <ChatView translations={translations[language]} setCurrentView={setCurrentView} />}

      {currentView === "doctor" && <CropDoctorView setCurrentView={setCurrentView} />}

      {currentView === "market" && <MarketView setCurrentView={setCurrentView} />}

      {currentView === "schemes" && <SchemesView setCurrentView={setCurrentView} />}

      {currentView !== "onboarding" && <BottomNav currentView={currentView} setCurrentView={setCurrentView} />}
    </div>
  )
}
