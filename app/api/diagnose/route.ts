import { generateText } from "@/lib/generateText" // Assuming generateText is imported from a library

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return Response.json(
        {
          error: "API key not configured",
          message: "The AI service is not properly configured.",
        },
        { status: 500 },
      )
    }

    const { text } = await generateText({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert agricultural pathologist. Analyze this crop/plant leaf image and provide:
1. Disease name (if any disease is detected, otherwise state "Healthy")
2. Confidence level (0-100)
3. Treatment steps (as an array of 3-5 specific actionable steps)

If the leaf appears healthy, provide preventive care tips instead of treatment.
If you cannot identify a specific disease, suggest general pest/disease management practices.

Format your response as JSON:
{
  "disease": "Disease name or 'Healthy'",
  "confidence": 85,
  "treatment": ["Step 1", "Step 2", "Step 3"]
}`,
            },
            {
              type: "image",
              image: image,
            },
          ],
        },\
      });

    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text
      const result = JSON.parse(jsonStr)

      return Response.json({
        disease: result.disease || "Unknown Disease",
        confidence: result.confidence || 75,
        treatment: Array.isArray(result.treatment) ? result.treatment : ["Consult an agricultural expert"],
      })
    } catch (parseError) {
      console.error("[v0] JSON Parse Error:", parseError, "Original text:", text)
      return Response.json({
        disease: "Analysis Complete",
        confidence: 70,
        treatment: ["Remove and destroy affected parts", "Ensure proper ventilation", "Monitor closely"],
      })
    }
  } catch (error: any) {
    console.error("[v0] Diagnose API error:", error)
    const isQuotaError = JSON.stringify(error).includes("429") || JSON.stringify(error).includes("quota")

    return Response.json(
      {
        error: "Failed to analyze image",
        disease: isQuotaError ? "Service Busy" : "Analysis Failed",
        confidence: 0,
        treatment: [
          isQuotaError ? "The AI limit has been reached. Try again later." : "Please try again with a clearer photo.",
        ],
      },
      { status: error.status || 500 },
    )
  }
}
