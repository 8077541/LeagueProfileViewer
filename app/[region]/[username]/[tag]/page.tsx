import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SummonerProfile } from "@/components/summoner-profile"
import { PlayerStats } from "@/components/player-stats"
import { MatchList } from "@/components/match-list"
import { ProfilePageWrapper } from "@/components/profile-page-wrapper"
import { ProfileLoadingSpinner } from "@/components/profile-loading-spinner"
import { MatchesLoading } from "@/components/matches-loading"
import {
  getSummonerByRiotId,
  getLeagueEntries,
  getMatchIds,
  getMatchDetailsInBatches,
  getStaticData,
  initializeCache,
} from "@/lib/riot"

interface ProfilePageProps {
  params: {
    region: string
    username: string
    tag: string
  }
}

// Create a separate component for the profile content to enable proper loading states
async function ProfileContent({ region, username, tag }: { region: string; username: string; tag: string }) {
  try {
    // Fetch summoner data
    const summoner = await getSummonerByRiotId(region, username, tag)

    // Fetch league entries
    const leagueEntries = await getLeagueEntries(region, summoner.id)

    // Fetch static data (items, runes, summoner spells)
    const staticData = await getStaticData()

    // Try to fetch initial match data, but don't fail the whole page if it doesn't work
    const matchData = { matches: [], errors: [] }
    try {
      // Fetch match IDs - reduced to 10 to avoid rate limiting
      const matchIds = await getMatchIds(region, summoner.puuid, 10)

      // Fetch match details in batches to avoid rate limiting
      const { matches, errors } = await getMatchDetailsInBatches(region, matchIds, 3)

      matchData.matches = matches
      matchData.errors = errors

      if (errors.length > 0) {
        console.log(`Failed to fetch ${errors.length} matches due to errors`)
      }
    } catch (error: any) {
      console.error("Error fetching match data:", error)
      matchData.errors.push(error)
    }

    // Determine if we should show an error or partial data warning
    const showError = matchData.matches.length === 0 && matchData.errors.length > 0
    const showPartialDataWarning = matchData.matches.length > 0 && matchData.errors.length > 0

    const displayName = summoner.gameName || summoner.name || "Unknown"

    return (
      <div className="container max-w-6xl mx-auto p-4 space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to search</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">League Profile Viewer</h1>
        </div>

        <SummonerProfile summoner={summoner} leagueEntries={leagueEntries} />

        {matchData.matches.length > 0 && (
          <PlayerStats
            matches={matchData.matches}
            puuid={summoner.puuid}
            staticData={staticData}
            totalMatchesLoaded={matchData.matches.length}
          />
        )}

        {showError ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to load match history</AlertTitle>
            <AlertDescription>
              We couldn't retrieve the match history due to a Riot API rate limit. Please try again later.
            </AlertDescription>
          </Alert>
        ) : showPartialDataWarning ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Partial match history loaded</AlertTitle>
            <AlertDescription>
              We were able to load some matches, but couldn't retrieve all matches due to Riot API rate limits.
            </AlertDescription>
          </Alert>
        ) : null}

        <Suspense fallback={<MatchesLoading showHeader={true} count={3} />}>
          <MatchList
            initialMatches={matchData.matches}
            puuid={summoner.puuid}
            summonerName={displayName}
            region={region}
            staticData={staticData}
          />
        </Suspense>
      </div>
    )
  } catch (error: any) {
    console.error("Error fetching profile data:", error)
    return notFound()
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { region, username, tag } = params

  // Initialize cache (clears expired items)
  if (typeof window !== "undefined") {
    initializeCache()
  }

  return (
    <ProfilePageWrapper>
      <Suspense fallback={<ProfileLoadingSpinner username={username} tag={tag} region={region} />}>
        <ProfileContent region={region} username={username} tag={tag} />
      </Suspense>
    </ProfilePageWrapper>
  )
}
