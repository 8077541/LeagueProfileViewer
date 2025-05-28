"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { MatchDetails } from "@/components/match-details"
import { DATA_DRAGON } from "@/lib/riot"
import { getQueueTypeName } from "@/lib/constants"

interface MatchCardProps {
  match: any
  puuid: string
  staticData: {
    items: any
    runes: any
    summonerSpells: any
  }
  searchTerm?: string
}

export function MatchCard({ match, puuid, staticData, searchTerm = "" }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Find players that match the search term
  const matchingPlayers = useMemo(() => {
    if (!searchTerm) return []

    const normalizedSearchTerm = searchTerm.toLowerCase().trim()
    return match.info.participants.filter((p: any) => {
      const summonerName = p.summonerName?.toLowerCase() || ""
      const riotIdGameName = p.riotIdGameName?.toLowerCase() || ""
      return summonerName.includes(normalizedSearchTerm) || riotIdGameName.includes(normalizedSearchTerm)
    })
  }, [match.info.participants, searchTerm])

  // Find the participant data for the current summoner
  const participant = match.info.participants.find((p: any) => p.puuid === puuid)

  if (!participant) return null

  // Determine if the match was a win
  const isWin = participant.win

  // Calculate KDA
  const kills = participant.kills
  const deaths = participant.deaths
  const assists = participant.assists
  const kda = deaths === 0 ? "Perfect" : ((kills + assists) / deaths).toFixed(2)

  // Get match duration and time ago
  const durationMinutes = Math.floor(match.info.gameDuration / 60)
  const durationSeconds = match.info.gameDuration % 60
  const timeAgo = formatDistanceToNow(new Date(match.info.gameCreation), { addSuffix: true })

  // Get queue type
  const queueType = getQueueTypeName(match.info.queueId)

  // Get items (ensure we have 7 slots total)
  const itemSlots = [
    { id: participant.item0 || 0, isTrinket: false },
    { id: participant.item1 || 0, isTrinket: false },
    { id: participant.item2 || 0, isTrinket: false },
    { id: participant.item3 || 0, isTrinket: false },
    { id: participant.item4 || 0, isTrinket: false },
    { id: participant.item5 || 0, isTrinket: false },
    { id: participant.item6 || 0, isTrinket: true },
  ]

  // Get summoner spells
  const summonerSpells = staticData.summonerSpells.data
  const spell1 = Object.values(summonerSpells).find((spell: any) => spell.key === participant.summoner1Id.toString())
  const spell2 = Object.values(summonerSpells).find((spell: any) => spell.key === participant.summoner2Id.toString())

  // Get primary and secondary rune styles
  const primaryStyle = participant.perks.styles[0]
  const secondaryStyle = participant.perks.styles[1]

  // Find rune data
  const findRuneData = (runeId: number) => {
    for (const style of staticData.runes) {
      // Check keystone runes
      for (const slot of style.slots) {
        for (const rune of slot.runes) {
          if (rune.id === runeId) {
            return rune
          }
        }
      }
    }
    return null
  }

  // Find style data
  const findStyleData = (styleId: number) => {
    return staticData.runes.find((style: any) => style.id === styleId)
  }

  const primaryRuneData = findRuneData(primaryStyle.selections[0].perk)
  const primaryStyleData = findStyleData(primaryStyle.style)
  const secondaryStyleData = findStyleData(secondaryStyle.style)

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  // Auto-expand if there's a search match and it's not already expanded
  if (searchTerm && matchingPlayers.length > 0 && !expanded) {
    setExpanded(true)
  }

  // Highlight function for player names
  const highlightName = (name: string) => {
    if (!searchTerm) return name

    const normalizedSearchTerm = searchTerm.toLowerCase().trim()
    const normalizedName = name.toLowerCase()

    if (!normalizedName.includes(normalizedSearchTerm)) return name

    const startIndex = normalizedName.indexOf(normalizedSearchTerm)
    const endIndex = startIndex + normalizedSearchTerm.length

    return (
      <>
        {name.substring(0, startIndex)}
        <span className="bg-yellow-200 text-black px-0.5 rounded">{name.substring(startIndex, endIndex)}</span>
        {name.substring(endIndex)}
      </>
    )
  }

  // Separate participants by team
  const blueTeam = match.info.participants.filter((p: any) => p.teamId === 100)
  const redTeam = match.info.participants.filter((p: any) => p.teamId === 200)

  return (
    <Card
      className={`border-l-4 ${
        isWin ? "border-l-green-500" : "border-l-red-500"
      } shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${
        searchTerm && matchingPlayers.length > 0 ? "ring-2 ring-yellow-400" : ""
      }`}
      onClick={toggleExpanded}
    >
      <CardContent className="p-4 max-w-full">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
          {/* Game info */}
          <div className="flex-none w-32">
            <div className="font-medium">{queueType}</div>
            <div className="text-sm text-gray-500">{timeAgo}</div>
            <div className="text-sm text-gray-500">
              {durationMinutes}m {durationSeconds}s
            </div>
            <div className={`text-sm font-medium ${isWin ? "text-green-500" : "text-red-500"}`}>
              {isWin ? "Victory" : "Defeat"}
            </div>
          </div>

          {/* Champion and spells */}
          <div className="flex-none flex items-center gap-1">
            <div className="relative">
              <div className="h-12 w-12 rounded overflow-hidden">
                <Image
                  src={DATA_DRAGON.championIcon(participant.championName) || "/placeholder.svg"}
                  alt={participant.championName}
                  width={48}
                  height={48}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs px-1 rounded">
                {participant.champLevel}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {spell1 && (
                <div className="h-6 w-6 rounded overflow-hidden">
                  <Image
                    src={DATA_DRAGON.summonerSpellIcon(spell1.id) || "/placeholder.svg"}
                    alt={spell1.name}
                    width={24}
                    height={24}
                  />
                </div>
              )}

              {spell2 && (
                <div className="h-6 w-6 rounded overflow-hidden">
                  <Image
                    src={DATA_DRAGON.summonerSpellIcon(spell2.id) || "/placeholder.svg"}
                    alt={spell2.name}
                    width={24}
                    height={24}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {primaryStyleData && primaryRuneData && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-6 w-6 rounded overflow-hidden bg-gray-200">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/img/${primaryRuneData.icon}`}
                          alt={primaryRuneData.name}
                          width={24}
                          height={24}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{primaryRuneData.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {secondaryStyleData && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-6 w-6 rounded overflow-hidden bg-gray-200">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/img/${secondaryStyleData.icon}`}
                          alt={secondaryStyleData.name}
                          width={24}
                          height={24}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{secondaryStyleData.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* KDA */}
          <div className="flex-none w-28 text-center">
            <div className="font-medium">
              {kills} / <span className="text-red-500">{deaths}</span> / {assists}
            </div>
            <div className="text-sm text-gray-500">{kda} KDA</div>
            <div className="text-xs text-gray-500">
              CS: {participant.totalMinionsKilled + participant.neutralMinionsKilled}
            </div>
          </div>

          {/* Items */}
          <div className="flex-none flex flex-wrap gap-1 justify-center min-w-[220px]">
            {itemSlots.map((item, index) =>
              item.id ? (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-8 w-8 rounded overflow-hidden bg-gray-200 ${item.isTrinket ? "border border-yellow-400" : ""}`}
                      >
                        <Image
                          src={DATA_DRAGON.itemIcon(item.id) || "/placeholder.svg"}
                          alt={`Item ${item.id}`}
                          width={32}
                          height={32}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{staticData.items.data[item.id]?.name || "Unknown Item"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div
                  key={index}
                  className={`h-8 w-8 rounded bg-gray-500 ${item.isTrinket ? "border border-yellow-400" : ""}`}
                />
              ),
            )}
          </div>

          {/* Players */}
          <div className="flex-grow flex gap-8">
            {/* Blue Team */}
            <div className="flex-1 text-xs space-y-1 min-w-[120px]">
              {blueTeam.map((p: any) => {
                const isSearchMatch =
                  searchTerm &&
                  ((p.summonerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (p.riotIdGameName?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
                const region = match.info.platformId.toLowerCase()
                const name = p.summonerName || p.riotIdGameName || "Unknown"
                const tag = p.riotIdTagline || "NA1"

                return (
                  <div
                    key={p.puuid}
                    className={`flex items-center gap-1 ${p.puuid === puuid ? "font-bold" : ""} ${
                      isSearchMatch ? "bg-yellow-100 rounded px-1" : ""
                    }`}
                  >
                    <div className="h-4 w-4 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={DATA_DRAGON.championIcon(p.championName) || "/placeholder.svg"}
                        alt={p.championName}
                        width={16}
                        height={16}
                      />
                    </div>
                    <Link
                      href={`/${region}/${name}/${tag}`}
                      className="truncate max-w-[100px] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isSearchMatch ? highlightName(name) : name}
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Red Team */}
            <div className="flex-1 text-xs space-y-1 min-w-[120px]">
              {redTeam.map((p: any) => {
                const isSearchMatch =
                  searchTerm &&
                  ((p.summonerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                    (p.riotIdGameName?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
                const region = match.info.platformId.toLowerCase()
                const name = p.summonerName || p.riotIdGameName || "Unknown"
                const tag = p.riotIdTagline || "NA1"

                return (
                  <div
                    key={p.puuid}
                    className={`flex items-center gap-1 ${p.puuid === puuid ? "font-bold" : ""} ${
                      isSearchMatch ? "bg-yellow-100 rounded px-1" : ""
                    }`}
                  >
                    <div className="h-4 w-4 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={DATA_DRAGON.championIcon(p.championName) || "/placeholder.svg"}
                        alt={p.championName}
                        width={16}
                        height={16}
                      />
                    </div>
                    <Link
                      href={`/${region}/${name}/${tag}`}
                      className="truncate max-w-[100px] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isSearchMatch ? highlightName(name) : name}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Expand/Collapse button */}
          <div className="flex-none">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded()
              }}
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Expanded match details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <MatchDetails match={match} currentPuuid={puuid} staticData={staticData} searchTerm={searchTerm} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
