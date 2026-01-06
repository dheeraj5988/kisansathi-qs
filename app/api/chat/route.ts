import { generateText } from "ai" // Using 'ai' instead of 'ai-sdk' for v5 support

export async function POST(req: Request) {
  try {
    const { message, language, history } = await req.json()

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("[v0] No API key found in environment variables")
      return Response.json(
        {
          error: "API key not configured",
          response: "The AI service is not properly configured. Please ensure GOOGLE_API_KEY is set.",
        },
        { status: 500 },
      )
    }

    const historyMessages = (history || []).slice(-6).map((h: { role: string; content: string }) => ({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content,
    }))

    const systemPrompt = `You are KisanSathi, a professional Indian agricultural expert AI assistant. You provide practical, accurate advice to farmers.

Your expertise includes:
- Crop cultivation techniques and best practices for Indian climate zones
- Pest and disease identification and organic/chemical treatment methods
- Weather-based farming decisions and seasonal planning
- Government schemes (PM-KISAN, PMFBY, soil health cards, etc.)
- Market prices, MSP rates, and selling strategies
- Soil health management and fertilizer recommendations
- Water management and irrigation techniques
- Organic farming and sustainable agriculture

Communication style:
- Speak in simple, clear language that farmers can understand
- Be supportive and encouraging
- Provide actionable steps whenever possible
- If asked in Hindi or regional languages, respond in that language
- Keep responses concise (2-3 paragraphs) but comprehensive

Current language preference: ${language || "en"}`

    // Updated model to google/gemini-2.5-flash-lite
    const { text } = await generateText({
      model: "google/gemini-2.5-flash-lite",
      system: systemPrompt,
      messages: [...historyMessages, { role: "user", content: message }],
      maxOutputTokens: 500, // Updated to maxOutputTokens per AI SDK v5
      temperature: 0.7,
    })

    return Response.json({ response: text })
  } catch (error: any) {
    console.error("[v0] Chat API error details:", error)

    const errorMessage = error.message || ""
    const isQuotaError =
      errorMessage.includes("429") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      (error.data && JSON.stringify(error.data).includes("RESOURCE_EXHAUSTED"))

    if (isQuotaError) {
      return Response.json(
        {
          error: "API quota exceeded",
          response:
            "I'm sorry, but my daily limit has been reached. I'll be back soon! Please try again in a few hours.",
        },
        { status: 429 },
      )
    }

    return Response.json(
      {
        error: "Failed to generate response",
        response: "I apologize, but I'm having trouble right now. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}
