import { type NextRequest, NextResponse } from "next/server"
import { getSummonerByRiotId, getLeagueEntries } from "@/lib/riot"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region")
    const name = searchParams.get("name")
    const tag = searchParams.get("tag")

    if (!region || !name || !tag) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Fetch summoner data
    const summoner = await getSummonerByRiotId(region, name, tag)

    // Fetch league entries
    const leagueEntries = await getLeagueEntries(region, summoner.id)

    return NextResponse.json({
      summoner,
      leagueEntries,
    })
  } catch (error: any) {
    console.error("API Error fetching summoner:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch summoner data" }, { status: 500 })
  }
}
