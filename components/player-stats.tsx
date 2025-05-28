"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DATA_DRAGON } from "@/lib/riot"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { QUEUE_CATEGORIES, isQueueInCategory } from "@/lib/constants"

interface PlayerStatsProps {
  matches: any[]
  puuid: string
  staticData: {
    champions: any
    items: any
    runes: any
    summonerSpells: any
  }
  totalMatchesLoaded?: number
}

export function PlayerStats({ matches, puuid, staticData, totalMatchesLoaded }: PlayerStatsProps) {
  const [queueFilter, setQueueFilter] = useState("all")

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No recent matches found</p>
        </CardContent>
      </Card>
    )
  }

  // Filter matches by queue type
  const filteredMatches = matches.filter((match) => isQueueInCategory(match.info.queueId, queueFilter))

  // Calculate overall stats
  let totalKills = 0
  let totalDeaths = 0
  let totalAssists = 0
  let totalGames = 0
  let totalWins = 0
  let totalCs = 0
  let totalVisionScore = 0
  let totalDamageDealt = 0
  let totalGoldEarned = 0
  let totalGameDuration = 0

  // Track champion play counts
  const championCounts: Record<
    string,
    { count: number; wins: number; kills: number; deaths: number; assists: number }
  > = {}

  // Track positions played
  const positionCounts: Record<string, number> = {}

  // Process each match
  filteredMatches.forEach((match) => {
    const participant = match.info.participants.find((p: any) => p.puuid === puuid)
    if (!participant) return

    totalGames++
    totalKills += participant.kills
    totalDeaths += participant.deaths
    totalAssists += participant.assists
    totalCs += participant.totalMinionsKilled + participant.neutralMinionsKilled
    totalVisionScore += participant.visionScore || 0
    totalDamageDealt += participant.totalDamageDealtToChampions
    totalGoldEarned += participant.goldEarned
    totalGameDuration += match.info.gameDuration

    if (participant.win) {
      totalWins++
    }

    // Track champion stats
    const championName = participant.championName
    if (!championCounts[championName]) {
      championCounts[championName] = { count: 0, wins: 0, kills: 0, deaths: 0, assists: 0 }
    }
    championCounts[championName].count++
    championCounts[championName].kills += participant.kills
    championCounts[championName].deaths += participant.deaths
    championCounts[championName].assists += participant.assists
    if (participant.win) {
      championCounts[championName].wins++
    }

    // Track position
    const position = participant.individualPosition || participant.lane || "UNKNOWN"
    if (position !== "UNKNOWN") {
      positionCounts[position] = (positionCounts[position] || 0) + 1
    }
  })

  // Calculate averages
  const avgKills = totalGames > 0 ? (totalKills / totalGames).toFixed(1) : "0"
  const avgDeaths = totalGames > 0 ? (totalDeaths / totalGames).toFixed(1) : "0"
  const avgAssists = totalGames > 0 ? (totalAssists / totalGames).toFixed(1) : "0"
  const kda = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : "Perfect"
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0
  const avgCs = totalGames > 0 ? Math.round(totalCs / totalGames) : 0
  const totalGameDurationMinutes = totalGameDuration / 60
  const avgCsPerMin = totalGameDurationMinutes > 0 ? (totalCs / totalGameDurationMinutes).toFixed(1) : "0"
  const avgVisionScore = totalGames > 0 ? Math.round(totalVisionScore / totalGames) : 0
  const avgDamage = totalGames > 0 ? Math.round(totalDamageDealt / totalGames).toLocaleString() : "0"
  const avgGold = totalGames > 0 ? Math.round(totalGoldEarned / totalGames).toLocaleString() : "0"

  // Get most played champions (top 5)
  const mostPlayedChampions = Object.entries(championCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([championName, stats]) => ({
      name: championName,
      count: stats.count,
      winRate: Math.round((stats.wins / stats.count) * 100),
      kda: stats.deaths > 0 ? ((stats.kills + stats.assists) / stats.deaths).toFixed(2) : "Perfect",
    }))

  // Get most played position
  const mostPlayedPosition =
    Object.entries(positionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([position]) => formatPosition(position))[0] || "Unknown"

  // Format position name
  function formatPosition(position: string): string {
    const positionMap: Record<string, string> = {
      TOP: "Top",
      JUNGLE: "Jungle",
      MIDDLE: "Mid",
      BOTTOM: "Bot",
      UTILITY: "Support",
      MID: "Mid",
      ADC: "Bot",
      SUPPORT: "Support",
    }
    return positionMap[position] || position
  }

  // Get queue counts for the dropdown
  const queueCounts: Record<string, number> = { all: matches.length }
  QUEUE_CATEGORIES.forEach((category) => {
    if (category.id !== "all") {
      queueCounts[category.id] = matches.filter((match) => isQueueInCategory(match.info.queueId, category.id)).length
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Performance Stats</h2>
        <div className="w-48">
          <Select value={queueFilter} onValueChange={setQueueFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by queue" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {QUEUE_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} {queueCounts[category.id] > 0 && `(${queueCounts[category.id]})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No matches found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No matches found for the selected queue type.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Recent Performance ({totalGames}{" "}
                {queueFilter !== "all" ? QUEUE_CATEGORIES.find((c) => c.id === queueFilter)?.name : "games"}
                {totalMatchesLoaded && totalMatchesLoaded > matches.length && (
                  <span className="text-sm font-normal text-gray-500"> of {totalMatchesLoaded} loaded</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Win Rate</div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{winRate}%</div>
                    <div className="text-sm text-gray-500">
                      {totalWins}W {totalGames - totalWins}L
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${winRate}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-500">KDA</div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{kda}</div>
                    <div className="text-sm text-gray-500">
                      {avgKills} / {avgDeaths} / {avgAssists}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500">CS per Game</div>
                  <div className="font-semibold">
                    {avgCs} ({avgCsPerMin}/min)
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Vision Score</div>
                  <div className="font-semibold">{avgVisionScore}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Avg. Damage</div>
                  <div className="font-semibold">{avgDamage}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Avg. Gold</div>
                  <div className="font-semibold">{avgGold}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Played Champions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostPlayedChampions.length > 0 ? (
                  mostPlayedChampions.map((champion) => (
                    <div key={champion.name} className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-12 w-12 rounded overflow-hidden">
                              <Image
                                src={DATA_DRAGON.championIcon(champion.name) || "/placeholder.svg"}
                                alt={champion.name}
                                width={48}
                                height={48}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{champion.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex-grow">
                        <div className="font-medium">{champion.name}</div>
                        <div className="text-sm text-gray-500">
                          {champion.count} games, {champion.winRate}% win rate
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{champion.kda} KDA</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No champion data available</p>
                )}

                {mostPlayedPosition !== "Unknown" && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-sm text-gray-500">Most Played Position</div>
                    <div className="font-medium">{mostPlayedPosition}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
