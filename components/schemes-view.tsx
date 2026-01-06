"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, Search, ExternalLink, ChevronDown, ChevronUp, RefreshCw, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ViewType } from "@/app/page"

interface Scheme {
  title: string
  category: string
  status: string
  desc: string
  details?: string
}

const fallbackSchemes: Scheme[] = [
  {
    title: "Pradhan Mantri Fasal Bima Yojana",
    category: "Insurance",
    status: "Open",
    desc: "Crop insurance scheme for farmers against crop failure",
    details:
      "This scheme provides financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
  },
  {
    title: "PM-KISAN",
    category: "Subsidies",
    status: "Open",
    desc: "Direct income support of ₹6,000 per year to farmers",
    details:
      "Under this scheme, all landholding farmers' families shall get ₹6,000 per year in three equal installments.",
  },
  {
    title: "Kisan Credit Card",
    category: "Loans",
    status: "Open",
    desc: "Easy credit for agricultural needs at low interest",
    details:
      "KCC provides affordable credit for farmers for their cultivation needs, purchase of inputs and other farm expenses.",
  },
]

const categories = ["All", "Subsidies", "Loans", "Insurance"]

export default function SchemesView({ setCurrentView }: { setCurrentView: (view: ViewType) => void }) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchSchemes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8000/api/schemes")
      if (!response.ok) throw new Error("Schemes API failed")
      const data = await response.json()
      // Handle different response formats
      const schemesArray = Array.isArray(data) ? data : data.schemes || data.data || []
      setSchemes(schemesArray.length > 0 ? schemesArray : fallbackSchemes)
    } catch (err) {
      console.error("Schemes fetch error:", err)
      setError("Failed to load schemes. Using cached data.")
      setSchemes(fallbackSchemes)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchemes()
  }, [fetchSchemes])

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "All" || s.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const toggleAccordion = (title: string) => {
    setExpandedId(expandedId === title ? null : title)
  }

  return (
    <div className="flex-1 flex flex-col pb-24 bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border flex items-center gap-3">
        <button onClick={() => setCurrentView("dashboard")} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Government Schemes</h1>
      </div>

      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes (e.g., PM-Kisan)..."
            className="h-12 pl-12 text-base border-2 rounded-xl"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-xl">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              onClick={fetchSchemes}
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading schemes...</p>
          </div>
        </div>
      ) : (
        /* Schemes List - Accordion style */
        <div className="flex-1 overflow-auto px-4 space-y-3">
          {filteredSchemes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No schemes found matching your search.</p>
            </div>
          ) : (
            filteredSchemes.map((scheme) => (
              <Card key={scheme.title} className="bg-card border-0 shadow-md overflow-hidden">
                <button onClick={() => toggleAccordion(scheme.title)} className="w-full p-4 text-left">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-foreground pr-2">{scheme.title}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                          scheme.status === "Open" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {scheme.status}
                      </span>
                      {expandedId === scheme.title ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{scheme.desc}</p>
                </button>

                {expandedId === scheme.title && (
                  <div className="px-4 pb-4 border-t border-border">
                    <div className="pt-4">
                      {scheme.details && <p className="text-foreground mb-4">{scheme.details}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {scheme.category}
                        </span>
                        <Button
                          variant="outline"
                          className="h-10 border-2 border-primary text-primary hover:bg-primary/10 bg-transparent"
                        >
                          Apply Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
