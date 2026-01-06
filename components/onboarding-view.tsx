"use client"
import { Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LanguageType } from "@/app/page"

interface OnboardingViewProps {
  language: LanguageType
  setLanguage: (lang: LanguageType) => void
  onComplete: () => void
}

const languages: { code: LanguageType; name: string; native: string }[] = [
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "en", name: "English", native: "English" },
]

export default function OnboardingView({ language, setLanguage, onComplete }: OnboardingViewProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 bg-card shadow-xl border-0">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sprout className="w-10 h-10 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">KisanSathi</h1>
          <p className="text-muted-foreground text-lg mt-1">Farmer's Friend</p>
        </div>

        <p className="text-center text-lg font-medium mb-6 text-foreground">Select Your Language</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-4 rounded-xl border-2 transition-all min-h-[72px] flex flex-col items-center justify-center ${
                language === lang.code
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span className="text-xl font-bold">{lang.native}</span>
              <span className="text-sm text-muted-foreground">{lang.name}</span>
            </button>
          ))}
        </div>
        <Button
          onClick={onComplete}
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Continue
        </Button>
      </Card>
    </div>
  )
}
