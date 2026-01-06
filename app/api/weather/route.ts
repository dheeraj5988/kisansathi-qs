import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return Response.json({ error: "Missing lat/lon parameters" }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    console.error("[v0] Weather API key not configured")
    return Response.json({ error: "Weather API not configured. Please add OPENWEATHER_API_KEY." }, { status: 500 })
  }

  try {
    console.log("[v0] Fetching weather from OpenWeather API...")

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenWeather API error:", response.status, errorText)
      throw new Error(`OpenWeather API returned ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Weather data received:", data.name, data.main?.temp)

    return Response.json({
      location: data.name || "Your Location",
      name: data.name,
      temp: Math.round(data.main?.temp || 28),
      condition: data.weather?.[0]?.description || "Clear",
      humidity: data.main?.humidity,
      windSpeed: data.wind?.speed,
    })
  } catch (error) {
    console.error("[v0] Weather fetch error:", error)
    return Response.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
