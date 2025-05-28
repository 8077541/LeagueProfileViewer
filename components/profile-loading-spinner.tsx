import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { formatSummonerName, formatRegionDisplay } from "@/lib/utils"

interface ProfileLoadingSpinnerProps {
  username?: string
  tag?: string
  region?: string
}

export function ProfileLoadingSpinner({ username, tag, region }: ProfileLoadingSpinnerProps) {
  const displayName = username ? formatSummonerName(username, tag) : undefined
  const displayRegion = region ? formatRegionDisplay(region) : undefined

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Main Loading Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Large Spinner */}
            <div className="relative">
              <Spinner size="xl" className="border-t-blue-600" />
              <div className="absolute inset-0 animate-ping">
                <Spinner size="xl" className="border-t-blue-300 opacity-30" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-800">
                Loading Profile
                {displayName && <span className="text-blue-600"> for {displayName}</span>}
              </h2>
              <div className="space-y-2">
                <p className="text-lg text-gray-600">Fetching summoner data from Riot API...</p>
                {displayRegion && (
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Region: {displayRegion}</p>
                )}
              </div>
            </div>

            {/* Progress Steps */}
            <div className="w-full max-w-md space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Loading Steps</span>
                <span className="text-gray-500">Please wait...</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-blue-100 rounded-md">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-800">Fetching account information</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-md">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Loading rank data</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-md">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Fetching match history</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-md">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Loading game statistics</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center text-xs text-gray-500 max-w-md">
              <p>This may take a few moments due to Riot API rate limits and data processing.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton Cards for Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
