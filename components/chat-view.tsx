"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, Plus, Mic, Camera, Volume2, MicOff, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ViewType, LanguageType } from "@/app/page"

interface Message {
  id: number
  type: "user" | "ai"
  text: string
}

interface ChatViewProps {
  language: LanguageType
  translations: { tapToSpeak: string }
  setCurrentView: (view: ViewType) => void
}

const initialMessages: Message[] = [
  { id: 1, type: "ai", text: "Namaste! I am KisanSathi, your AI farming assistant. How can I help you today?" },
]

export default function ChatView({ language, translations, setCurrentView }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const speakMessage = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported")
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-IN"
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { id: Date.now(), type: "user", text: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const history = messages.map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.text,
    }))

    try {
      console.log("[v0] Sending chat request to Gemini API...")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          language: language,
          history: history,
        }),
      })

      const data = await response.json()
      console.log("[v0] Chat response received:", data)

      if (response.status === 429) {
        const aiResponse: Message = {
          id: Date.now() + 1,
          type: "ai",
          text: data.response || "My AI service has reached its daily limit. Please try again tomorrow.",
        }
        setMessages((prev) => [...prev, aiResponse])
        return
      }

      if (!response.ok) throw new Error(data.error || "Chat API failed")

      const aiResponse: Message = {
        id: Date.now() + 1,
        type: "ai",
        text: data.response || data.message || "I understand your concern. Could you provide more details?",
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("[v0] Chat API error:", error)
      const fallbackResponse: Message = {
        id: Date.now() + 1,
        type: "ai",
        text: "I'm having trouble connecting to the server. Please check your internet connection or try again later.",
      }
      setMessages((prev) => [...prev, fallbackResponse])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, language])

  return (
    <div className="flex-1 flex flex-col pb-20 bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border flex items-center gap-3">
        <button onClick={() => setCurrentView("dashboard")} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">KisanSathi</h1>
          <p className="text-sm text-primary">{isLoading ? "Thinking..." : "Online • Ready to help"}</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.type === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card text-card-foreground border border-border shadow-sm rounded-bl-sm"
              }`}
            >
              <p className="text-base whitespace-pre-line">{msg.text}</p>
              {msg.type === "ai" && (
                <button
                  onClick={() => speakMessage(msg.text)}
                  className="mt-3 flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Listen</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card text-card-foreground border border-border shadow-sm rounded-2xl rounded-bl-sm p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recording Overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-foreground/90 flex flex-col items-center justify-center z-50">
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-primary rounded-full"
                style={{
                  height: `${20 + Math.random() * 40}px`,
                  animation: `wave 0.5s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-2xl font-bold text-primary-foreground mb-8">Listening...</p>
          <Button
            onClick={() => setIsRecording(false)}
            variant="outline"
            className="h-14 px-8 text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
          >
            <MicOff className="w-6 h-6 mr-2" />
            Stop
          </Button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <button className="p-3 rounded-full bg-muted">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type or speak..."
            className="flex-1 h-12 text-base rounded-full border-2"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
          <button onClick={() => setIsRecording(true)} className="p-3 rounded-full bg-muted">
            <Mic className="w-6 h-6 text-muted-foreground" />
          </button>
          <button className="p-3 rounded-full bg-muted">
            <Camera className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
