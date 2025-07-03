"use client"

import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DATA_DRAGON } from "@/lib/riot"

interface MatchDetailsProps {
  match: any
  currentPuuid: string
  staticData: {
    items: any
    runes: any
    summonerSpells: any
  }
  searchTerm?: string
}

export function MatchDetails({ match, currentPuuid, staticData, searchTerm = "" }: MatchDetailsProps) {
  // Separate participants by team - handle variable team sizes
  const blueTeam = match.info.participants.filter((p: any) => p.teamId === 100)
  const redTeam = match.info.participants.filter((p: any) => p.teamId === 200)

  // Handle special game modes with different team structures
  const isArenaMode = match.info.participants.length === 8 // Arena 2v2v2v2
  const isSpecialMode = match.info.participants.length !== 10 // Not standard 5v5

  // For Arena mode, we might need to group differently
  let teamGroups = []
  if (isArenaMode) {
    // Arena mode: group by teamId, but there might be 4 teams of 2
    const teamMap = new Map()
    match.info.participants.forEach((p: any) => {
      if (!teamMap.has(p.teamId)) {
        teamMap.set(p.teamId, [])
      }
      teamMap.get(p.teamId).push(p)
    })
    teamGroups = Array.from(teamMap.entries())
  } else {
    // Standard mode: blue vs red
    teamGroups = [
      [100, blueTeam],
      [200, redTeam],
    ]
  }

  // Get team stats - handle cases where team data might not exist
  const getTeamStats = (teamId: number) => {
    const teamStats = match.info.teams?.find((team: any) => team.teamId === teamId)
    return (
      teamStats || {
        teamId,
        win: false,
        objectives: {
          champion: { kills: 0, first: false },
          tower: { kills: 0, first: false },
          inhibitor: { kills: 0, first: false },
          baron: { kills: 0, first: false },
          dragon: { kills: 0, first: false },
          riftHerald: { kills: 0, first: false },
        },
      }
    )
  }

  // Get region from match data
  const region = match.info.platformId.toLowerCase()

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

  // Create item slots array with empty slots for missing items
  const createItemSlots = (participant: any) => {
    return [
      { id: participant.item0 || 0, isTrinket: false },
      { id: participant.item1 || 0, isTrinket: false },
      { id: participant.item2 || 0, isTrinket: false },
      { id: participant.item3 || 0, isTrinket: false },
      { id: participant.item4 || 0, isTrinket: false },
      { id: participant.item5 || 0, isTrinket: false },
      { id: participant.item6 || 0, isTrinket: true },
    ]
  }

  // Check if a player matches the search term
  const isPlayerMatch = (player: any) => {
    if (!searchTerm) return false

    const normalizedSearchTerm = searchTerm.toLowerCase().trim()
    const summonerName = player.summonerName?.toLowerCase() || ""
    const riotIdGameName = player.riotIdGameName?.toLowerCase() || ""

    return summonerName.includes(normalizedSearchTerm) || riotIdGameName.includes(normalizedSearchTerm)
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4" onClick={(e) => e.stopPropagation()}>
        <TabsTrigger value="overview" onClick={(e) => e.stopPropagation()}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="builds" onClick={(e) => e.stopPropagation()}>
          Builds
        </TabsTrigger>
        <TabsTrigger value="damage" onClick={(e) => e.stopPropagation()}>
          Damage
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4" onClick={(e) => e.stopPropagation()}>
        {isSpecialMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Special Game Mode:</strong> This match has {match.info.participants.length} players
              {isArenaMode ? " (Arena Mode)" : ""}
            </p>
          </div>
        )}

        <div className={`grid gap-4 ${isArenaMode ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
          {teamGroups.map(([teamId, teamPlayers], index) => {
            const teamStats = getTeamStats(teamId)
            const teamColor = teamId === 100 ? "blue" : teamId === 200 ? "red" : "purple"
            const teamName = isArenaMode ? `Team ${index + 1}` : teamId === 100 ? "Blue Team" : "Red Team"

            return (
              <div key={teamId} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className={`font-semibold text-${teamColor}-600`}>
                    {teamName} {teamStats.win ? "(Victory)" : "(Defeat)"}
                  </h3>
                  <div className="text-sm">
                    <span className="font-medium">{teamStats.objectives?.champion?.kills || 0}</span> Kills
                    {!isArenaMode && (
                      <>
                        | <span className="font-medium">{teamStats.objectives?.tower?.kills || 0}</span> Towers |{" "}
                        <span className="font-medium">{teamStats.objectives?.dragon?.kills || 0}</span> Dragons
                      </>
                    )}
                  </div>
                </div>

                <div className={`bg-${teamColor}-50 rounded-md overflow-hidden`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`bg-${teamColor}-100`}>
                      <tr>
                        <th
                          className={`px-2 py-2 text-left text-xs font-medium text-${teamColor}-800 uppercase tracking-wider`}
                        >
                          Player
                        </th>
                        <th
                          className={`px-2 py-2 text-left text-xs font-medium text-${teamColor}-800 uppercase tracking-wider`}
                        >
                          KDA
                        </th>
                        <th
                          className={`px-2 py-2 text-left text-xs font-medium text-${teamColor}-800 uppercase tracking-wider`}
                        >
                          Damage
                        </th>
                        <th
                          className={`px-2 py-2 text-left text-xs font-medium text-${teamColor}-800 uppercase tracking-wider`}
                        >
                          CS
                        </th>
                        <th
                          className={`px-2 py-2 text-left text-xs font-medium text-${teamColor}-800 uppercase tracking-wider`}
                        >
                          Items
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {teamPlayers.map((player: any) => {
                        const isSearchMatch = isPlayerMatch(player)
                        const itemSlots = createItemSlots(player)

                        return (
                          <tr
                            key={player.puuid}
                            className={`${player.puuid === currentPuuid ? `bg-${teamColor}-50` : ""} ${
                              isSearchMatch ? "bg-yellow-100" : ""
                            }`}
                          >
                            {/* Player cell */}
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0 h-8 w-8 relative">
                                  <Image
                                    className="rounded"
                                    src={DATA_DRAGON.championIcon(player.championName) || "/placeholder.svg"}
                                    alt={player.championName}
                                    width={32}
                                    height={32}
                                  />
                                  <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs px-1 rounded">
                                    {player.champLevel}
                                  </div>
                                </div>
                                <Link
                                  href={`/${region}/${player.summonerName || player.riotIdGameName || "Unknown"}/${player.riotIdTagline || "NA1"}`}
                                  className="text-sm font-medium text-gray-900 truncate max-w-[100px] hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {isSearchMatch
                                    ? highlightName(player.summonerName || player.riotIdGameName || "Unknown")
                                    : player.summonerName || player.riotIdGameName || "Unknown"}
                                </Link>
                              </div>
                            </td>

                            {/* KDA cell */}
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-sm">
                                <span className="text-green-600">{player.kills}</span>/
                                <span className="text-red-600">{player.deaths}</span>/
                                <span className="text-blue-600">{player.assists}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {player.deaths === 0
                                  ? "Perfect"
                                  : ((player.kills + player.assists) / player.deaths).toFixed(2)}{" "}
                                KDA
                              </div>
                            </td>

                            {/* Damage cell */}
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-sm">{player.totalDamageDealtToChampions?.toLocaleString() || 0}</div>
                              <div className="text-xs text-gray-500">
                                {Math.round(
                                  ((player.totalDamageDealtToChampions || 0) / (match.info.gameDuration || 1)) * 60,
                                ).toLocaleString()}{" "}
                                / min
                              </div>
                            </td>

                            {/* CS cell */}
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-sm">
                                {(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.round(
                                  ((player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)) /
                                    ((match.info.gameDuration || 1) / 60),
                                ).toFixed(1)}{" "}
                                / min
                              </div>
                            </td>

                            {/* Items cell */}
                            <td className="px-2 py-2">
                              <div className="flex gap-1">
                                {itemSlots.map((item, index) =>
                                  item.id ? (
                                    <TooltipProvider key={index}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={`h-6 w-6 rounded overflow-hidden bg-gray-200 ${item.isTrinket ? "border border-yellow-400" : ""}`}
                                          >
                                            <Image
                                              src={DATA_DRAGON.itemIcon(item.id) || "/placeholder.svg"}
                                              alt={`Item ${item.id}`}
                                              width={24}
                                              height={24}
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
                                      className={`h-6 w-6 rounded bg-gray-500 ${item.isTrinket ? "border border-yellow-400" : ""}`}
                                    />
                                  ),
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="builds" className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blue Team Builds */}
          <div className="space-y-4">
            <h3 className="font-semibold text-blue-600">Blue Team Builds</h3>
            {blueTeam.map((player: any) => {
              // Find rune data
              const primaryStyle = player.perks.styles[0]
              const secondaryStyle = player.perks.styles[1]

              const findRuneData = (runeId: number) => {
                for (const style of staticData.runes) {
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

              const findStyleData = (styleId: number) => {
                return staticData.runes.find((style: any) => style.id === styleId)
              }

              const primaryRuneData = findRuneData(primaryStyle.selections[0].perk)
              const primaryStyleData = findStyleData(primaryStyle.style)
              const secondaryStyleData = findStyleData(secondaryStyle.style)

              // Get summoner spells
              const spell1 = Object.values(staticData.summonerSpells.data).find(
                (spell: any) => spell.key === player.summoner1Id.toString(),
              )
              const spell2 = Object.values(staticData.summonerSpells.data).find(
                (spell: any) => spell.key === player.summoner2Id.toString(),
              )

              const isSearchMatch = isPlayerMatch(player)

              // Create item slots array
              const itemSlots = createItemSlots(player)

              return (
                <div
                  key={player.puuid}
                  className={`bg-white p-3 rounded-md shadow ${isSearchMatch ? "ring-2 ring-yellow-400" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded overflow-hidden">
                      <Image
                        src={DATA_DRAGON.championIcon(player.championName) || "/placeholder.svg"}
                        alt={player.championName}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <Link
                        href={`/${region}/${player.summonerName || player.riotIdGameName || "Unknown"}/${player.riotIdTagline || "NA1"}`}
                        className="font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isSearchMatch
                          ? highlightName(player.summonerName || player.riotIdGameName || "Unknown")
                          : player.summonerName || player.riotIdGameName || "Unknown"}
                      </Link>
                      <div className="text-xs text-gray-500">{player.championName}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs font-medium mb-1">Runes</div>
                      <div className="flex items-center gap-2">
                        {primaryStyleData && primaryRuneData && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded overflow-hidden bg-gray-200">
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/img/${primaryRuneData.icon}`}
                                    alt={primaryRuneData.name}
                                    width={32}
                                    height={32}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{primaryRuneData.name}</p>
                                <p className="text-xs text-gray-500">{primaryStyleData.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {secondaryStyleData && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded overflow-hidden bg-gray-200">
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/img/${secondaryStyleData.icon}`}
                                    alt={secondaryStyleData.name}
                                    width={32}
                                    height={32}
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

                    <div>
                      <div className="text-xs font-medium mb-1">Spells</div>
                      <div className="flex items-center gap-2">
                        {spell1 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded overflow-hidden">
                                  <Image
                                    src={DATA_DRAGON.summonerSpellIcon(spell1.id) || "/placeholder.svg"}
                                    alt={spell1.name}
                                    width={32}
                                    height={32}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{spell1.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {spell2 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded overflow-hidden">
                                  <Image
                                    src={DATA_DRAGON.summonerSpellIcon(spell2.id) || "/placeholder.svg"}
                                    alt={spell2.name}
                                    width={32}
                                    height={32}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{spell2.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1">Items</div>
                    <div className="flex flex-wrap gap-1">
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
                                {staticData.items.data[item.id]?.plaintext && (
                                  <p className="text-xs text-gray-500">{staticData.items.data[item.id].plaintext}</p>
                                )}
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
                  </div>
                </div>
              )
            })}
          </div>

          {/* Red Team Builds */}
          <div className="space-y-4">
            <h3 className="font-semibold text-red-600">Red Team Builds</h3>
            {redTeam.map((player: any) => {
              // Find rune data
              const primaryStyle = player.perks.styles[0]
              const secondaryStyle = player.perks.styles[1]

              const findRuneData = (runeId: number) => {
                for (const style of staticData.runes) {
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

              const findStyleData = (styleId: number) => {
                return staticData.runes.find((style: any) => style.id === styleId)
              }

              const primaryRuneData = findRuneData(primaryStyle.selections[0].perk)
              const primaryStyleData = findStyleData(primaryStyle.style)
              const secondaryStyleData = findStyleData(secondaryStyle.style)

              // Get summoner spells
              const spell1 = Object.values(staticData.summonerSpells.data).find(
                (spell: any) => spell.key === player.summoner1Id.toString(),
              )
              const spell2 = Object.values(staticData.summonerSpells.data).find(
                (spell: any) => spell.key === player.summoner2Id.toString(),
              )

              const isSearchMatch = isPlayerMatch(player)

              // Create item slots array
              const itemSlots = createItemSlots(player)

              return (
                <div
                  key={player.puuid}
                  className={`bg-white p-3 rounded-md shadow ${isSearchMatch ? "ring-2 ring-yellow-400" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded overflow-hidden">
                      <Image
                        src={DATA_DRAGON.championIcon(player.championName) || "/placeholder.svg"}
                        alt={player.championName}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <Link
                        href={`/${region}/${player.summonerName || player.riotIdGameName || "Unknown"}/${player.riotIdTagline || "NA1"}`}
                        className="font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isSearchMatch
                          ? highlightName(player.summonerName || player.riotIdGameName || "Unknown")
                          : player.summonerName || player.riotIdGameName || "Unknown"}
                      </Link>
                      <div className="text-xs text-gray-500">{player.championName}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs font-medium mb-1">Runes</div>
                      <div className="flex items-center gap-2">
                        {primaryStyleData && primaryRuneData && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded overflow-hidden bg-gray-200">
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/img/${primaryRuneData.icon}`}
                                    alt={primaryRuneData.name}
                                    width={32}
                                    height={32}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{primaryRuneData.name}</p>
                                <p className="text-xs text-gray-500">{primaryStyleData.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {secondaryStyleData && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded overflow-hidden bg-gray-200">
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/img/${secondaryStyleData.icon}`}
                                    alt={secondaryStyleData.name}
                                    width={32}
                                    height={32}
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

                    <div>
                      <div className="text-xs font-medium mb-1">Spells</div>
                      <div className="flex items-center gap-2">
                        {spell1 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded overflow-hidden">
                                  <Image
                                    src={DATA_DRAGON.summonerSpellIcon(spell1.id) || "/placeholder.svg"}
                                    alt={spell1.name}
                                    width={32}
                                    height={32}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{spell1.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {spell2 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-8 w-8 rounded overflow-hidden">
                                  <Image
                                    src={DATA_DRAGON.summonerSpellIcon(spell2.id) || "/placeholder.svg"}
                                    alt={spell2.name}
                                    width={32}
                                    height={32}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{spell2.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1">Items</div>
                    <div className="flex flex-wrap gap-1">
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
                                {staticData.items.data[item.id]?.plaintext && (
                                  <p className="text-xs text-gray-500">{staticData.items.data[item.id].plaintext}</p>
                                )}
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
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="damage" className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blue Team Damage */}
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-600">Blue Team Damage</h3>
            <div className="bg-white rounded-md shadow p-4">
              {blueTeam
                .sort((a, b) => b.totalDamageDealtToChampions - a.totalDamageDealtToChampions)
                .map((player, index) => {
                  const maxDamage = blueTeam[0].totalDamageDealtToChampions
                  const percentage = (player.totalDamageDealtToChampions / maxDamage) * 100
                  const isSearchMatch = isPlayerMatch(player)

                  return (
                    <div
                      className={`mb-3 last:mb-0 ${isSearchMatch ? "bg-yellow-100 rounded px-2" : ""}`}
                      key={player.puuid}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded overflow-hidden">
                          <Image
                            src={DATA_DRAGON.championIcon(player.championName) || "/placeholder.svg"}
                            alt={player.championName}
                            width={24}
                            height={24}
                          />
                        </div>
                        <Link
                          href={`/${region}/${player.summonerName || player.riotIdGameName || "Unknown"}/${player.riotIdTagline || "NA1"}`}
                          className="text-sm font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isSearchMatch
                            ? highlightName(player.summonerName || player.riotIdGameName || "Unknown")
                            : player.summonerName || player.riotIdGameName || "Unknown"}
                        </Link>
                        <div className="text-sm ml-auto">{player.totalDamageDealtToChampions.toLocaleString()}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  )
                })}
            </div>

            <h3 className="font-semibold text-blue-600 mt-4">Blue Team Damage Taken</h3>
            <div className="bg-white rounded-md shadow p-4">
              {blueTeam
                .sort((a, b) => b.totalDamageTaken - a.totalDamageTaken)
                .map((player, index) => {
                  const maxDamage = blueTeam[0].totalDamageTaken
                  const percentage = (player.totalDamageTaken / maxDamage) * 100
                  const isSearchMatch = isPlayerMatch(player)

                  return (
                    <div
                      key={player.puuid}
                      className={`mb-3 last:mb-0 ${isSearchMatch ? "bg-yellow-100 rounded px-2" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded overflow-hidden">
                          <Image
                            src={DATA_DRAGON.championIcon(player.championName) || "/placeholder.svg"}
                            alt={player.championName}
                            width={24}
                            height={24}
                          />
                        </div>
                        <Link
                          href={`/${region}/${player.summonerName || player.riotIdGameName || "Unknown"}/${player.riotIdTagline || "NA1"}`}
                          className="text-sm font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isSearchMatch
                            ? highlightName(player.summonerName || player.riotIdGameName || "Unknown")
                            : player.summonerName || player.riotIdGameName || "Unknown"}
                        </Link>
                        <div className="text-sm ml-auto">{player.totalDamageTaken.toLocaleString()}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Red Team Damage */}
          <div className="space-y-2">
            <h3 className="font-semibold text-red-600">Red Team Damage</h3>
            <div className="bg-white rounded-md shadow p-4">
              {redTeam
                .sort((a, b) => b.totalDamageDealtToChampions - a.totalDamageDealtToChampions)
                .map((player, index) => {
                  const maxDamage = redTeam[0].totalDamageDealtToChampions
                  const percentage = (player.totalDamageDealtToChampions / maxDamage) * 100
                  const isSearchMatch = isPlayerMatch(player)

                  return (
                    <div
                      key={player.puuid}
                      className={`mb-3 last:mb-0 ${isSearchMatch ? "bg-yellow-100 rounded px-2" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded overflow-hidden">
                          <Image
                            src={DATA_DRAGON.championIcon(player.championName) || "/placeholder.svg"}
                            alt={player.championName}
                            width={24}
                            height={24}
                          />
                        </div>
                        <Link
                          href={`/${region}/${player.summonerName || player.riotIdGameName || "Unknown"}/${player.riotIdTagline || "NA1"}`}
                          className="text-sm font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isSearchMatch
                            ? highlightName(player.summonerName || player.riotIdGameName || "Unknown")
                            : player.summonerName || player.riotIdGameName || "Unknown"}
                        </Link>
                        <div className="text-sm ml-auto">{player.totalDamageDealtToChampions.toLocaleString()}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  )
                })}
            </div>

            <h3 className="font-semibold text-red-600 mt-4">Red Team Damage Taken</h3>
            <div className="bg-white rounded-md shadow p-4">
              {redTeam
                .sort((a, b) => b.totalDamageTaken - a.totalDamageTaken)
                .map((player, index) => {
                  const maxDamage = redTeam[0].totalDamageTaken
                  const percentage = (player.totalDamageTaken / maxDamage) * 100
                  const isSearchMatch = isPlayerMatch(player)

                  return (
                    <div
                      key={player.puuid}
                      className={`mb-3 last:mb-0 ${isSearchMatch ? "bg-yellow-100 rounded px-2" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded overflow-hidden">
                          <Image
                            src={DATA_DRAGON.championIcon(player.championName) || "/placeholder.svg"}
                            alt={player.championName}
                            width={24}
                            height={24}
                          />
                        </div>
                        <Link
                          href={`/${region}/${player.summonerName || player.riotIdGameName || "Unknown"}/${player.riotIdTagline || "NA1"}`}
                          className="text-sm font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isSearchMatch
                            ? highlightName(player.summonerName || player.riotIdGameName || "Unknown")
                            : player.summonerName || player.riotIdGameName || "Unknown"}
                        </Link>
                        <div className="text-sm ml-auto">{player.totalDamageTaken.toLocaleString()}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
