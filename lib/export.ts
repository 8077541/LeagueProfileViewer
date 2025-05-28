// Export utilities for match history data

export interface ExportableMatch {
  matchId: string
  gameCreation: number
  gameDuration: number
  gameMode: string
  gameType: string
  queueId: number
  queueType: string
  mapId: number
  platformId: string
  gameVersion: string
  participant: {
    puuid: string
    summonerName: string
    championName: string
    championId: number
    teamId: number
    win: boolean
    kills: number
    deaths: number
    assists: number
    kda: number | string
    totalDamageDealt: number
    totalDamageDealtToChampions: number
    totalDamageTaken: number
    totalHeal: number
    totalMinionsKilled: number
    neutralMinionsKilled: number
    totalCS: number
    champLevel: number
    goldEarned: number
    goldSpent: number
    item0: number
    item1: number
    item2: number
    item3: number
    item4: number
    item5: number
    item6: number
    summoner1Id: number
    summoner2Id: number
    visionScore: number
    wardsPlaced: number
    wardsKilled: number
    firstBloodKill: boolean
    firstTowerKill: boolean
    role: string
    lane: string
    individualPosition: string
  }
  teamStats: {
    teamId: number
    win: boolean
    firstBlood: boolean
    firstTower: boolean
    firstInhibitor: boolean
    firstBaron: boolean
    firstDragon: boolean
    firstRiftHerald: boolean
    towerKills: number
    inhibitorKills: number
    baronKills: number
    dragonKills: number
    riftHeraldKills: number
    totalKills: number
  }
}

export function transformMatchForExport(match: any, puuid: string): ExportableMatch {
  const participant = match.info.participants.find((p: any) => p.puuid === puuid)
  const team = match.info.teams.find((t: any) => t.teamId === participant?.teamId)

  if (!participant) {
    throw new Error("Participant not found in match data")
  }

  const kda = participant.deaths === 0 ? "Perfect" : (participant.kills + participant.assists) / participant.deaths

  return {
    matchId: match.metadata.matchId,
    gameCreation: match.info.gameCreation,
    gameDuration: match.info.gameDuration,
    gameMode: match.info.gameMode,
    gameType: match.info.gameType,
    queueId: match.info.queueId,
    queueType: getQueueTypeName(match.info.queueId),
    mapId: match.info.mapId,
    platformId: match.info.platformId,
    gameVersion: match.info.gameVersion,
    participant: {
      puuid: participant.puuid,
      summonerName: participant.summonerName || participant.riotIdGameName || "Unknown",
      championName: participant.championName,
      championId: participant.championId,
      teamId: participant.teamId,
      win: participant.win,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      kda: typeof kda === "number" ? Number(kda.toFixed(2)) : kda,
      totalDamageDealt: participant.totalDamageDealt,
      totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
      totalDamageTaken: participant.totalDamageTaken,
      totalHeal: participant.totalHeal,
      totalMinionsKilled: participant.totalMinionsKilled,
      neutralMinionsKilled: participant.neutralMinionsKilled,
      totalCS: participant.totalMinionsKilled + participant.neutralMinionsKilled,
      champLevel: participant.champLevel,
      goldEarned: participant.goldEarned,
      goldSpent: participant.goldSpent,
      item0: participant.item0,
      item1: participant.item1,
      item2: participant.item2,
      item3: participant.item3,
      item4: participant.item4,
      item5: participant.item5,
      item6: participant.item6,
      summoner1Id: participant.summoner1Id,
      summoner2Id: participant.summoner2Id,
      visionScore: participant.visionScore || 0,
      wardsPlaced: participant.wardsPlaced || 0,
      wardsKilled: participant.wardsKilled || 0,
      firstBloodKill: participant.firstBloodKill || false,
      firstTowerKill: participant.firstTowerKill || false,
      role: participant.role || "",
      lane: participant.lane || "",
      individualPosition: participant.individualPosition || "",
    },
    teamStats: {
      teamId: team?.teamId || participant.teamId,
      win: team?.win || participant.win,
      firstBlood: team?.objectives?.champion?.first || false,
      firstTower: team?.objectives?.tower?.first || false,
      firstInhibitor: team?.objectives?.inhibitor?.first || false,
      firstBaron: team?.objectives?.baron?.first || false,
      firstDragon: team?.objectives?.dragon?.first || false,
      firstRiftHerald: team?.objectives?.riftHerald?.first || false,
      towerKills: team?.objectives?.tower?.kills || 0,
      inhibitorKills: team?.objectives?.inhibitor?.kills || 0,
      baronKills: team?.objectives?.baron?.kills || 0,
      dragonKills: team?.objectives?.dragon?.kills || 0,
      riftHeraldKills: team?.objectives?.riftHerald?.kills || 0,
      totalKills: team?.objectives?.champion?.kills || 0,
    },
  }
}

function getQueueTypeName(queueId: number): string {
  const QUEUE_TYPES: Record<number, string> = {
    400: "Normal Draft",
    420: "Ranked Solo/Duo",
    430: "Normal Blind",
    440: "Ranked Flex",
    450: "ARAM",
    700: "Clash",
    830: "Co-op vs AI (Intro)",
    840: "Co-op vs AI (Beginner)",
    850: "Co-op vs AI (Intermediate)",
    900: "URF",
    1020: "One for All",
    1300: "Nexus Blitz",
    1400: "Ultimate Spellbook",
    1900: "URF",
    2000: "Tutorial 1",
    2010: "Tutorial 2",
    2020: "Tutorial 3",
  }
  return QUEUE_TYPES[queueId] || "Custom Game"
}

export function exportToJSON(matches: any[], puuid: string, summonerName: string): void {
  try {
    const exportData = {
      exportInfo: {
        summonerName,
        puuid,
        exportDate: new Date().toISOString(),
        totalMatches: matches.length,
        version: "1.0",
      },
      matches: matches.map((match) => transformMatchForExport(match, puuid)),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${summonerName}_match_history_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting to JSON:", error)
    throw new Error("Failed to export match history as JSON")
  }
}

export function exportToCSV(matches: any[], puuid: string, summonerName: string): void {
  try {
    const exportableMatches = matches.map((match) => transformMatchForExport(match, puuid))

    // Define CSV headers
    const headers = [
      "Match ID",
      "Date",
      "Duration (min)",
      "Queue Type",
      "Champion",
      "Result",
      "KDA",
      "Kills",
      "Deaths",
      "Assists",
      "CS",
      "Damage to Champions",
      "Gold Earned",
      "Vision Score",
      "Position",
      "Team Kills",
      "Team Dragons",
      "Team Towers",
      "Items",
    ]

    // Convert matches to CSV rows
    const csvRows = exportableMatches.map((match) => {
      const date = new Date(match.gameCreation).toLocaleDateString()
      const duration = Math.round(match.gameDuration / 60)
      const result = match.participant.win ? "Victory" : "Defeat"
      const kda = `${match.participant.kills}/${match.participant.deaths}/${match.participant.assists}`
      const items = [
        match.participant.item0,
        match.participant.item1,
        match.participant.item2,
        match.participant.item3,
        match.participant.item4,
        match.participant.item5,
        match.participant.item6,
      ]
        .filter((item) => item > 0)
        .join("|")

      return [
        match.matchId,
        date,
        duration,
        match.queueType,
        match.participant.championName,
        result,
        match.participant.kda,
        match.participant.kills,
        match.participant.deaths,
        match.participant.assists,
        match.participant.totalCS,
        match.participant.totalDamageDealtToChampions,
        match.participant.goldEarned,
        match.participant.visionScore,
        match.participant.individualPosition || match.participant.lane,
        match.teamStats.totalKills,
        match.teamStats.dragonKills,
        match.teamStats.towerKills,
        items,
      ].map((field) => {
        // Escape fields that contain commas or quotes
        const stringField = String(field)
        if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
          return `"${stringField.replace(/"/g, '""')}"`
        }
        return stringField
      })
    })

    // Combine headers and rows
    const csvContent = [headers, ...csvRows].map((row) => row.join(",")).join("\n")

    // Create and download the file
    const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${summonerName}_match_history_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting to CSV:", error)
    throw new Error("Failed to export match history as CSV")
  }
}
