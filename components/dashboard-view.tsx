"use client"

import { useState, useCallback, useEffect } from "react"
import {
  MapPin,
  Bell,
  Sun,
  CloudRain,
  Cloud,
  Camera,
  TrendingUp,
  ScrollText,
  Tractor,
  Mic,
  Locate,
  X,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ViewType } from "@/app/page"

interface DashboardViewProps {
  farmerName: string
  translations: { greeting: string; tapToSpeak: string; askAbout: string }
  setCurrentView: (view: ViewType) => void
}

interface Notification {
  id: number
  type: "weather" | "scheme" | "market"
  message: string
  timestamp: string
}

const quickActions = [
  { id: "doctor", icon: Camera, label: "Crop Doctor", color: "bg-red-500", desc: "Disease Detection" },
  { id: "market", icon: TrendingUp, label: "Mandi Rates", color: "bg-blue-500", desc: "Market Prices" },
  { id: "schemes", icon: ScrollText, label: "Govt Schemes", color: "bg-amber-500", desc: "Subsidies" },
  { id: "farm", icon: Tractor, label: "My Farm", color: "bg-primary", desc: "Farm Profile" },
]

function getWeatherIcon(condition: string) {
  const lower = condition.toLowerCase()
  if (lower.includes("rain") || lower.includes("drizzle")) return CloudRain
  if (lower.includes("cloud")) return Cloud
  return Sun
}

export default function DashboardView({ farmerName, translations, setCurrentView }: DashboardViewProps) {
  const [weather, setWeather] = useState<{
    location: string
    city: string
    state: string
    temp: number
    condition: string
  }>({
    location: "Location not set",
    city: "Unknown",
    state: "",
    temp: 28,
    condition: "Clear",
  })
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const newNotifications: Notification[] = []

    // Weather-based notifications
    if (weather.condition.toLowerCase().includes("rain")) {
      newNotifications.push({
        id: 1,
        type: "weather",
        message: `Rain expected in ${weather.city}. Delay pesticide application.`,
        timestamp: "Just now",
      })
    }

    // Add scheme notification
    newNotifications.push({
      id: 2,
      type: "scheme",
      message: "New PM-KISAN subsidy installment released. Check eligibility.",
      timestamp: "2 hours ago",
    })

    // Add market alert (only if we have location)
    if (weather.city !== "Unknown") {
      newNotifications.push({
        id: 3,
        type: "market",
        message: "Tomato prices increased by 12% in local mandi.",
        timestamp: "5 hours ago",
      })
    }

    setNotifications(newNotifications.slice(0, 3))
  }, [weather])

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setIsLoadingWeather(true)
    setLocationError(null)

    try {
      const weatherResponse = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      if (!weatherResponse.ok) throw new Error("Weather API failed")
      const weatherData = await weatherResponse.json()

      const locationName = weatherData.location || weatherData.name || "Your Location"

      setWeather({
        location: locationName,
        city: locationName,
        state: "",
        temp: Math.round(weatherData.temp || weatherData.main?.temp || 28),
        condition: weatherData.condition || weatherData.weather?.[0]?.description || "Clear",
      })
    } catch (error) {
      setLocationError("Could not fetch weather data")
    } finally {
      setIsLoadingWeather(false)
    }
  }, [])

  const fetchWeatherByIP = useCallback(async () => {
    setIsLoadingWeather(true)
    setLocationError(null)

    try {
      const ipResponse = await fetch("https://ipapi.co/json/")
      if (!ipResponse.ok) throw new Error("IP location failed")

      const ipData = await ipResponse.json()

      const lat = ipData.latitude
      const lon = ipData.longitude

      if (lat && lon) {
        await fetchWeather(lat, lon)
      } else {
        throw new Error("No coordinates from IP location")
      }
    } catch (error) {
      setLocationError("Could not detect location. Using default weather.")
      setIsLoadingWeather(false)
    }
  }, [fetchWeather])

  const handleLocateMe = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      fetchWeatherByIP()
      return
    }

    setIsLoadingWeather(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchWeather(latitude, longitude)
      },
      () => {
        fetchWeatherByIP()
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      },
    )
  }, [fetchWeather, fetchWeatherByIP])

  const WeatherIcon = getWeatherIcon(weather.condition)

  return (
    <div className="flex-1 pb-24 overflow-auto">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">
              {translations.greeting}, {farmerName}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLocateMe}
              disabled={isLoadingWeather}
              className="h-8 px-2 text-xs border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              <Locate className="w-4 h-4 mr-1" />
              {isLoadingWeather ? "Detecting..." : "Locate Me"}
            </Button>
          </div>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {weather.city}
              {weather.state && `, ${weather.state}`}
            </span>
          </div>
          {locationError && <p className="text-xs text-destructive mt-1">{locationError}</p>}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 rounded-full bg-card shadow-md"
          >
            <Bell className="w-6 h-6 text-foreground" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-card" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-2xl border border-border z-50">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Notifications</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="max-h-96 overflow-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">No new notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notif.type === "weather"
                              ? "bg-blue-500"
                              : notif.type === "scheme"
                                ? "bg-amber-500"
                                : "bg-primary"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="px-4 mb-6">
        <Card className="p-5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
          {isLoadingWeather ? (
            <div className="animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-full" />
                <div>
                  <div className="h-10 w-24 bg-primary-foreground/20 rounded mb-2" />
                  <div className="h-6 w-32 bg-primary-foreground/20 rounded" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <WeatherIcon className="w-16 h-16" strokeWidth={1.5} />
                <div>
                  <p className="text-4xl font-bold">{weather.temp}°C</p>
                  <p className="text-lg opacity-90 capitalize">{weather.condition}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Ask KisanSathi - Hero Section */}
      <div className="px-4 mb-8">
        <div className="flex flex-col items-center">
          <button
            onClick={() => setCurrentView("chat")}
            className="w-28 h-28 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl animate-pulse-mic mb-4"
          >
            <Mic className="w-12 h-12" strokeWidth={2} />
          </button>
          <p className="text-xl font-bold text-foreground">{translations.tapToSpeak}</p>
          <p className="text-muted-foreground mt-1">{translations.askAbout}</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4">
        <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => action.id !== "farm" && setCurrentView(action.id as ViewType)}
              className="p-5 rounded-2xl bg-card shadow-md border border-border hover:shadow-lg transition-all text-left"
            >
              <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <p className="font-bold text-foreground text-lg">{action.label}</p>
              <p className="text-sm text-muted-foreground">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
