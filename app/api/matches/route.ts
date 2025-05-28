import { type NextRequest, NextResponse } from "next/server"
import { getMatchIds, getMatchDetailsInBatches } from "@/lib/riot"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region")
    const puuid = searchParams.get("puuid")
    const start = Number.parseInt(searchParams.get("start") || "0")
    const count = Number.parseInt(searchParams.get("count") || "10")

    if (!region || !puuid) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Fetch match IDs
    const matchIds = await getMatchIds(region, puuid, count, start)

    if (matchIds.length === 0) {
      return NextResponse.json({ matches: [], errors: [], hasMore: false })
    }

    // Fetch match details in batches with progress tracking
    const { matches, errors } = await getMatchDetailsInBatches(region, matchIds, 5)

    // Determine if there are more matches available
    const hasMore = matches.length === count

    return NextResponse.json({
      matches,
      errors,
      hasMore,
      totalFetched: matches.length,
    })
  } catch (error: any) {
    console.error("API Error fetching matches:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch matches" }, { status: 500 })
  }
}
