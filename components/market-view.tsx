"use client"

import { useState } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, Calculator } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ViewType } from "@/app/page"

const marketData = [
  { name: "Kumbakonam Mandi", price: 2400, change: 50, trend: "up" },
  { name: "Thanjavur Market", price: 2350, change: 25, trend: "up" },
  { name: "Trichy APMC", price: 2280, change: -30, trend: "down" },
  { name: "Madurai Mandi", price: 2450, change: 75, trend: "up" },
]

export default function MarketView({ setCurrentView }: { setCurrentView: (view: ViewType) => void }) {
  const [selectedCrop, setSelectedCrop] = useState("Tomato")
  const [selectedDistrict, setSelectedDistrict] = useState("Thanjavur")
  const [transportCost, setTransportCost] = useState("")
  const [loadWeight, setLoadWeight] = useState("")

  const calculateProfit = () => {
    if (!transportCost || !loadWeight) return null
    const bestPrice = Math.max(...marketData.map((m) => m.price))
    const totalRevenue = bestPrice * Number.parseFloat(loadWeight)
    const profit = totalRevenue - Number.parseFloat(transportCost)
    return profit.toFixed(0)
  }

  return (
    <div className="flex-1 flex flex-col pb-24 bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border flex items-center gap-3">
        <button onClick={() => setCurrentView("dashboard")} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Mandi Rates</h1>
      </div>

      {/* Filters */}
      <div className="p-4 flex gap-3">
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="flex-1 h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground font-medium"
        >
          <option>Tomato</option>
          <option>Onion</option>
          <option>Potato</option>
          <option>Rice</option>
        </select>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="flex-1 h-12 px-4 rounded-xl border-2 border-border bg-card text-foreground font-medium"
        >
          <option>Thanjavur</option>
          <option>Trichy</option>
          <option>Madurai</option>
          <option>Chennai</option>
        </select>
      </div>

      {/* Price List */}
      <div className="flex-1 overflow-auto px-4 space-y-3">
        {marketData.map((market, i) => (
          <Card key={i} className="p-4 bg-card border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-foreground">{market.name}</p>
                <p className="text-muted-foreground">{selectedCrop}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">₹{market.price}</p>
                <p className="text-sm text-muted-foreground">per quintal</p>
              </div>
            </div>
            <div
              className={`mt-3 flex items-center gap-1 ${market.trend === "up" ? "text-primary" : "text-destructive"}`}
            >
              {market.trend === "up" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="font-semibold">
                ₹{Math.abs(market.change)} {market.trend === "up" ? "up" : "down"} since yesterday
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Profit Calculator */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-6 h-6 text-primary" />
          <h2 className="font-bold text-lg text-foreground">Profit Calculator</h2>
        </div>
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Transport Cost (₹)</label>
            <Input
              type="number"
              value={transportCost}
              onChange={(e) => setTransportCost(e.target.value)}
              placeholder="500"
              className="h-12 text-lg border-2"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Load Weight (Q)</label>
            <Input
              type="number"
              value={loadWeight}
              onChange={(e) => setLoadWeight(e.target.value)}
              placeholder="10"
              className="h-12 text-lg border-2"
            />
          </div>
        </div>
        {calculateProfit() && (
          <div className="p-4 bg-primary/10 rounded-xl">
            <p className="text-sm text-muted-foreground">Estimated Net Profit</p>
            <p className="text-3xl font-bold text-primary">₹{calculateProfit()}</p>
          </div>
        )}
      </div>
    </div>
  )
}
