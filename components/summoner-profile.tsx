"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { DATA_DRAGON } from "@/lib/riot"
import { useEffect, useState } from "react"

interface SummonerProfileProps {
  summoner: {
    name?: string
    gameName?: string
    tagLine?: string
    profileIconId: number
    summonerLevel: number
  }
  leagueEntries: Array<{
    queueType: string
    tier?: string
    rank?: string
    leaguePoints?: number
    wins: number
    losses: number
  }>
}

// Function to get tier color
function getTierColor(tier?: string): string {
  if (!tier) return "text-gray-500"

  switch (tier.toUpperCase()) {
    case "IRON":
      return "text-gray-600"
    case "BRONZE":
      return "text-amber-700"
    case "SILVER":
      return "text-gray-400"
    case "GOLD":
      return "text-yellow-500"
    case "PLATINUM":
      return "text-cyan-400"
    case "EMERALD":
      return "text-emerald-500"
    case "DIAMOND":
      return "text-blue-400"
    case "MASTER":
      return "text-purple-500"
    case "GRANDMASTER":
      return "text-red-500"
    case "CHALLENGER":
      return "text-amber-600" // Changed from text-yellow-300 to text-amber-600 for better visibility
    default:
      return "text-gray-500"
  }
}

// Also update the getTierBgColor function for consistency
function getTierBgColor(tier?: string): string {
  if (!tier) return "bg-gray-200"

  switch (tier.toUpperCase()) {
    case "IRON":
      return "bg-gray-600"
    case "BRONZE":
      return "bg-amber-700"
    case "SILVER":
      return "bg-gray-400"
    case "GOLD":
      return "bg-yellow-500"
    case "PLATINUM":
      return "bg-cyan-400"
    case "EMERALD":
      return "bg-emerald-500"
    case "DIAMOND":
      return "bg-blue-400"
    case "MASTER":
      return "bg-purple-500"
    case "GRANDMASTER":
      return "bg-red-500"
    case "CHALLENGER":
      return "bg-amber-600" // Changed from bg-yellow-300 to bg-amber-600
    default:
      return "bg-gray-200"
  }
}

// Update the getTierGlowColor function for consistency
function getTierGlowColor(tier?: string): string {
  if (!tier) return "rgba(156, 163, 175, 0.3)"

  switch (tier.toUpperCase()) {
    case "IRON":
      return "rgba(75, 85, 99, 0.4)"
    case "BRONZE":
      return "rgba(180, 83, 9, 0.4)"
    case "SILVER":
      return "rgba(156, 163, 175, 0.4)"
    case "GOLD":
      return "rgba(234, 179, 8, 0.4)"
    case "PLATINUM":
      return "rgba(34, 211, 238, 0.4)"
    case "EMERALD":
      return "rgba(16, 185, 129, 0.4)"
    case "DIAMOND":
      return "rgba(96, 165, 250, 0.4)"
    case "MASTER":
      return "rgba(168, 85, 247, 0.4)"
    case "GRANDMASTER":
      return "rgba(239, 68, 68, 0.4)"
    case "CHALLENGER":
      return "rgba(217, 119, 6, 0.5)" // Changed from rgba(253, 224, 71, 0.5) to rgba(217, 119, 6, 0.5)
    default:
      return "rgba(156, 163, 175, 0.3)"
  }
}

// Function to calculate LP progress within rank
function calculateLPProgress(tier?: string, rank?: string, lp?: number): number {
  if (!tier || !lp) return 0

  // Master, Grandmaster, and Challenger don't have traditional ranks
  if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier.toUpperCase())) {
    return 100 // Always show full for these tiers
  }

  // For other tiers, LP ranges from 0-100 within each rank
  return Math.min(100, Math.max(0, lp))
}

// Function to get next rank/tier info
function getNextRankInfo(tier?: string, rank?: string): string {
  if (!tier || !rank) return ""

  const tierUpper = tier.toUpperCase()
  const rankUpper = rank.toUpperCase()

  // Special handling for high tiers
  if (tierUpper === "CHALLENGER") return "Peak Rank"
  if (tierUpper === "GRANDMASTER") return "to Challenger"
  if (tierUpper === "MASTER") return "to Grandmaster"

  // Regular tier progression
  const ranks = ["IV", "III", "II", "I"]
  const tiers = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER"]

  const currentRankIndex = ranks.indexOf(rankUpper)
  const currentTierIndex = tiers.indexOf(tierUpper)

  if (currentRankIndex === -1 || currentTierIndex === -1) return ""

  // If not at rank I, next is the next rank in same tier
  if (currentRankIndex > 0) {
    return `to ${tier} ${ranks[currentRankIndex - 1]}`
  }

  // If at rank I, next is the next tier
  if (currentTierIndex < tiers.length - 1) {
    return `to ${tiers[currentTierIndex + 1]} IV`
  }

  return "to Master"
}

// Rank Emblem component with special effects
function RankEmblem({ tier, size = 128 }: { tier?: string; size?: number }) {
  const [pulseState, setPulseState] = useState(0)
  const isHighTier = tier?.toUpperCase() === "CHALLENGER" || tier?.toUpperCase() === "GRANDMASTER"
  const isMaster = tier?.toUpperCase() === "MASTER"

  // Pulse animation for high tier ranks
  useEffect(() => {
    if (isHighTier || isMaster) {
      const interval = setInterval(() => {
        setPulseState((prev) => (prev + 1) % 100)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isHighTier, isMaster])

  const tierGlowColor = getTierGlowColor(tier)
  const tierColor = getTierColor(tier).replace("text-", "")

  // Special styles for high tier ranks
  const getSpecialStyles = () => {
    if (!isHighTier && !isMaster) return {}

    // Base styles for Master+
    const baseStyles = {
      filter: `contrast(1.2) saturate(1.3) ${isMaster ? "hue-rotate(0deg)" : ""}`,
    }

    // Additional styles for Challenger/Grandmaster
    if (isHighTier) {
      const pulseIntensity = Math.sin(pulseState / 15) * 0.15 + 1
      const rotateAmount = Math.sin(pulseState / 25) * 2

      return {
        ...baseStyles,
        transform: `scale(${pulseIntensity * 1.5}) rotate(${rotateAmount}deg)`,
        filter: `contrast(1.3) saturate(1.5) brightness(${pulseIntensity})`,
      }
    }

    return baseStyles
  }

  // Special container styles for high tier ranks
  const getContainerStyles = () => {
    if (!tier) return {}

    const baseStyles = {
      boxShadow: `0 0 20px ${tierGlowColor}, 0 0 40px ${tierGlowColor}`,
    }

    if (tier.toUpperCase() === "CHALLENGER") {
      // Gold/yellow pulsing glow for Challenger - using darker amber color
      const pulseIntensity = Math.sin(pulseState / 15) * 0.3 + 1
      return {
        ...baseStyles,
        boxShadow: `0 0 ${20 * pulseIntensity}px rgba(217, 119, 6, 0.5), 
                  0 0 ${40 * pulseIntensity}px rgba(217, 119, 6, 0.5), 
                  0 0 ${60 * pulseIntensity}px rgba(217, 119, 6, 0.3)`,
        background: `radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0) 70%)`,
      }
    }

    if (tier.toUpperCase() === "GRANDMASTER") {
      // Red pulsing glow for Grandmaster
      const pulseIntensity = Math.sin(pulseState / 15) * 0.3 + 1
      return {
        ...baseStyles,
        boxShadow: `0 0 ${20 * pulseIntensity}px rgba(239, 68, 68, 0.5), 
                    0 0 ${40 * pulseIntensity}px rgba(239, 68, 68, 0.5), 
                    0 0 ${60 * pulseIntensity}px rgba(239, 68, 68, 0.3)`,
        background: `radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0) 70%)`,
      }
    }

    if (tier.toUpperCase() === "MASTER") {
      // Purple subtle glow for Master
      const pulseIntensity = Math.sin(pulseState / 20) * 0.2 + 1
      return {
        ...baseStyles,
        boxShadow: `0 0 ${20 * pulseIntensity}px rgba(168, 85, 247, 0.5), 
                    0 0 ${40 * pulseIntensity}px rgba(168, 85, 247, 0.4)`,
      }
    }

    return baseStyles
  }

  // Special classes for high tier ranks
  const getSpecialClasses = () => {
    if (tier?.toUpperCase() === "CHALLENGER") {
      return "challenger-emblem"
    }
    if (tier?.toUpperCase() === "GRANDMASTER") {
      return "grandmaster-emblem"
    }
    if (tier?.toUpperCase() === "MASTER") {
      return "master-emblem"
    }
    return ""
  }

  return (
    <div
      className={`w-32 h-32 flex-shrink-0 relative rounded-full transition-all duration-300 hover:scale-105 ${getSpecialClasses()}`}
      style={getContainerStyles()}
    >
      {/* Special background effects for Challenger/Grandmaster */}
      {tier?.toUpperCase() === "CHALLENGER" && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-yellow-500 opacity-10 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-radial from-yellow-400/20 to-transparent"></div>
          <div
            className="absolute top-0 left-0 w-full h-full animate-spin-slow opacity-30"
            style={{
              backgroundImage: "linear-gradient(0deg, transparent 45%, rgba(253, 224, 71, 0.5) 50%, transparent 55%)",
              backgroundSize: "100% 500%",
              backgroundPosition: "0 0",
            }}
          ></div>
        </div>
      )}

      {tier?.toUpperCase() === "GRANDMASTER" && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-red-500 opacity-10 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-radial from-red-500/20 to-transparent"></div>
          <div
            className="absolute top-0 left-0 w-full h-full animate-spin-slow opacity-30"
            style={{
              backgroundImage: "linear-gradient(0deg, transparent 45%, rgba(239, 68, 68, 0.5) 50%, transparent 55%)",
              backgroundSize: "100% 500%",
              backgroundPosition: "0 0",
            }}
          ></div>
        </div>
      )}

      <div className="w-full h-full overflow-hidden rounded-full">
        <Image
          src={DATA_DRAGON.rankEmblem(tier || "unranked") || "/placeholder.svg"}
          alt={`${tier || "Unranked"} emblem`}
          width={size}
          height={size}
          className="w-full h-full object-cover scale-150 transform"
          style={{
            objectPosition: "center",
            ...getSpecialStyles(),
          }}
        />
      </div>

      {/* Particle effects for Challenger */}
      {tier?.toUpperCase() === "CHALLENGER" && (
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-float-1 opacity-70"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-float-2 opacity-70"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-float-3 opacity-70"></div>
          <div className="absolute top-1/2 right-1/3 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-float-4 opacity-70"></div>
          <div className="absolute bottom-1/3 right-1/2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-float-5 opacity-70"></div>
        </div>
      )}

      {/* Border effect for high tier ranks */}
      {isHighTier && (
        <div
          className={`absolute -inset-1 rounded-full opacity-50 ${
            tier?.toUpperCase() === "CHALLENGER" ? "border-2 border-amber-600" : "border-2 border-red-500"
          }`}
        ></div>
      )}
    </div>
  )
}

export function SummonerProfile({ summoner, leagueEntries }: SummonerProfileProps) {
  // Find ranked solo/duo entry if it exists
  const rankedSolo = leagueEntries.find((entry) => entry.queueType === "RANKED_SOLO_5x5")

  // Find ranked flex entry if it exists
  const rankedFlex = leagueEntries.find((entry) => entry.queueType === "RANKED_FLEX_SR")

  // Use gameName and tagLine if available, otherwise fall back to name
  const displayName = summoner.gameName || summoner.name || "Unknown"
  const displayTag = summoner.tagLine ? `#${summoner.tagLine}` : ""

  const renderRankSection = (entry: typeof rankedSolo, queueName: string) => {
    if (!entry) return null

    const tierColor = getTierColor(entry.tier)
    const tierBgColor = getTierBgColor(entry.tier)
    const lpProgress = calculateLPProgress(entry.tier, entry.rank, entry.leaguePoints)
    const nextRankInfo = getNextRankInfo(entry.tier, entry.rank)
    const lpToNext = entry.leaguePoints !== undefined ? 100 - entry.leaguePoints : 0
    const isHighTier = entry.tier?.toUpperCase() === "CHALLENGER" || entry.tier?.toUpperCase() === "GRANDMASTER"

    return (
      <div className="flex items-center gap-4">
        <RankEmblem tier={entry.tier} />

        <div className="space-y-2 min-h-[128px] flex flex-col justify-center flex-1">
          <h3 className="text-sm font-medium text-gray-500">{queueName}</h3>
          <p className={`font-semibold text-lg ${tierColor} ${isHighTier ? "animate-pulse-subtle" : ""}`}>
            {entry.tier ? `${entry.tier} ${entry.rank}` : "Unranked"}
            {entry.leaguePoints !== undefined && ` (${entry.leaguePoints} LP)`}
          </p>
          <p className="text-sm text-gray-500">
            {entry.wins}W {entry.losses}L
            {entry.wins + entry.losses > 0 && ` (${Math.round((entry.wins / (entry.wins + entry.losses)) * 100)}%)`}
          </p>

          {/* LP Progress Bar */}
          {entry.tier && entry.leaguePoints !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{entry.leaguePoints} LP</span>
                {nextRankInfo && lpToNext > 0 && (
                  <span>
                    {lpToNext} LP {nextRankInfo}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${tierBgColor} ${
                    isHighTier ? "animate-pulse-subtle" : ""
                  }`}
                  style={{ width: `${lpProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="relative">
            <div className="rounded-full overflow-hidden border-4 border-gray-200 h-24 w-24">
              <Image
                src={DATA_DRAGON.profileIcon(summoner.profileIconId) || "/placeholder.svg"}
                alt={`${displayName}'s profile icon`}
                width={96}
                height={96}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">
              {summoner.summonerLevel}
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold">
              {displayName}
              <span className="text-gray-500 text-lg">{displayTag}</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
              {rankedSolo && renderRankSection(rankedSolo, "Ranked Solo/Duo")}
              {rankedFlex && renderRankSection(rankedFlex, "Ranked Flex")}

              {!rankedSolo && !rankedFlex && (
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-4">
                    <RankEmblem />
                    <div className="min-h-[128px] flex flex-col justify-center">
                      <p className="text-gray-500">No ranked data available</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
