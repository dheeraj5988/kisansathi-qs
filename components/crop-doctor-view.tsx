"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { ArrowLeft, Camera, Upload, Volume2, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { ViewType } from "@/app/page"

type DiagnosisState = "upload" | "scanning" | "result"

interface DiagnosisResult {
  disease: string
  confidence: number
  treatment: string[]
}

export default function CropDoctorView({ setCurrentView }: { setCurrentView: (view: ViewType) => void }) {
  const [state, setState] = useState<DiagnosisState>("upload")
  const [showTreatment, setShowTreatment] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const speakTreatment = useCallback(() => {
    if (!diagnosis || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const text = `Diagnosis: ${diagnosis.disease}. Treatment steps: ${diagnosis.treatment.join(". ")}`
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-IN"
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }, [diagnosis])

  const handleImageSelect = useCallback(async (file: File) => {
    setError(null)

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setState("scanning")

    try {
      console.log("[v0] Analyzing crop image with Gemini Vision...")

      // Convert image to base64
      const base64Promise = new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          // Remove data:image/xxx;base64, prefix
          const base64Data = base64.split(",")[1]
          resolve(base64Data)
        }
        reader.readAsDataURL(file)
      })

      const base64Image = await base64Promise

      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      })

      if (!response.ok) throw new Error("Diagnosis API failed")

      const data = await response.json()
      console.log("[v0] Diagnosis received:", data)

      setDiagnosis({
        disease: data.disease || data.diagnosis || "Unknown Disease",
        confidence: data.confidence || 85,
        treatment: Array.isArray(data.treatment)
          ? data.treatment
          : data.treatments || [
              "Consult a local agricultural expert",
              "Monitor the affected plants closely",
              "Isolate affected plants if possible",
            ],
      })
      setState("result")
    } catch (err) {
      console.error("[v0] Diagnosis error:", err)
      setError("Failed to analyze image. Please try again.")
      setState("upload")
      setImagePreview(null)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("image/")) {
        handleImageSelect(file)
      }
    },
    [handleImageSelect],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const resetUpload = () => {
    setState("upload")
    setImagePreview(null)
    setDiagnosis(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex-1 flex flex-col pb-24 bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border flex items-center gap-3">
        <button onClick={() => setCurrentView("dashboard")} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Crop Disease Detector</h1>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex-1 p-4">
        {state === "upload" && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="h-64 border-4 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-card"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">Take a Photo</p>
            <p className="text-muted-foreground mt-1">or drag & drop an image</p>
            {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
          </div>
        )}

        {state === "scanning" && (
          <div className="h-64 rounded-2xl bg-card border border-border overflow-hidden relative">
            {imagePreview ? (
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Leaf being scanned"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            )}
            <div className="absolute inset-0 bg-foreground/30">
              <div className="absolute left-0 right-0 h-1 bg-primary animate-scan" />
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-primary-foreground font-bold text-lg">Analyzing with AI...</p>
            </div>
          </div>
        )}

        {state === "result" && diagnosis && (
          <>
            <div className="h-48 rounded-2xl overflow-hidden mb-4">
              {imagePreview ? (
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Diagnosed leaf"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
            </div>

            <Card className="p-5 bg-card border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="text-2xl font-bold text-destructive">{diagnosis.disease}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold text-primary">{diagnosis.confidence}%</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <button
                  onClick={() => setShowTreatment(!showTreatment)}
                  className="w-full flex items-center justify-between py-2"
                >
                  <span className="font-bold text-lg text-foreground">Treatment Steps</span>
                  {showTreatment ? (
                    <ChevronUp className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>

                {showTreatment && (
                  <div className="mt-3 space-y-3">
                    {diagnosis.treatment.map((step, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-muted rounded-xl">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="flex-1 text-primary">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={speakTreatment}
                className="w-full h-14 mt-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                Listen to Cure
              </Button>
            </Card>

            <Button
              onClick={resetUpload}
              variant="outline"
              className="w-full h-14 mt-4 text-lg border-2 bg-transparent"
            >
              <Upload className="w-6 h-6 mr-2" />
              Scan Another Leaf
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
