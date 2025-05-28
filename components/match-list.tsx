"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MatchCard } from "@/components/match-card"
import { ExportButton } from "@/components/export-button"
import { BatchLoadingIndicator } from "@/components/batch-loading-indicator"
import { QUEUE_CATEGORIES, isQueueInCategory } from "@/lib/constants"
import { useMatchPagination } from "@/hooks/use-match-pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { MatchesLoading } from "@/components/matches-loading"

interface MatchListProps {
  initialMatches: any[]
  puuid: string
  summonerName: string
  region: string
  staticData: {
    items: any
    runes: any
    summonerSpells: any
  }
}

export function MatchList({ initialMatches, puuid, summonerName, region, staticData }: MatchListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [queueFilter, setQueueFilter] = useState("all")
  const [batchProgress, setBatchProgress] = useState({
    isVisible: false,
    currentBatch: 0,
    totalBatches: 0,
    currentMatch: 0,
    totalMatches: 0,
  })

  // Use the pagination hook
  const { matches, isLoading, hasMore, error, loadMore, totalLoaded } = useMatchPagination({
    region,
    puuid,
    staticData,
    initialMatches,
  })

  // Filter matches based on search term and queue type
  const filteredMatches = useMemo(() => {
    if (!matches || matches.length === 0) {
      return []
    }

    return matches.filter((match) => {
      // First, filter by queue type
      const matchesQueueFilter = isQueueInCategory(match.info.queueId, queueFilter)
      if (!matchesQueueFilter) return false

      // Then, if there's a search term, filter by player name
      if (!searchTerm.trim()) return true

      const normalizedSearchTerm = searchTerm.toLowerCase().trim()

      // Check if any participant's name contains the search term
      return match.info.participants.some((participant: any) => {
        // Check both summonerName and riotIdGameName fields
        const summonerName = participant.summonerName?.toLowerCase() || ""
        const riotIdGameName = participant.riotIdGameName?.toLowerCase() || ""

        return summonerName.includes(normalizedSearchTerm) || riotIdGameName.includes(normalizedSearchTerm)
      })
    })
  }, [matches, searchTerm, queueFilter])

  // Get the count of matches that contain the searched player
  const matchCount = filteredMatches?.length || 0
  const totalMatches = matches?.length || 0

  // Get counts by queue category for the badges
  const queueCounts = useMemo(() => {
    if (!matches || matches.length === 0) return {}

    const counts: Record<string, number> = { all: matches.length }

    QUEUE_CATEGORIES.forEach((category) => {
      if (category.id !== "all") {
        counts[category.id] = matches.filter((match) => isQueueInCategory(match.info.queueId, category.id)).length
      }
    })

    return counts
  }, [matches])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Handle queue filter change
  const handleQueueFilterChange = (value: string) => {
    setQueueFilter(value)
  }

  // Handle load more button click with batch progress tracking
  const handleLoadMore = async () => {
    setBatchProgress({
      isVisible: true,
      currentBatch: 0,
      totalBatches: 0,
      currentMatch: 0,
      totalMatches: 0,
    })

    try {
      await loadMore()
    } finally {
      setBatchProgress((prev) => ({ ...prev, isVisible: false }))
    }
  }

  // Handle retry on error
  const handleRetry = () => {
    loadMore()
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Matches</h2>
          <ExportButton matches={[]} puuid={puuid} summonerName={summonerName} disabled={true} />
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No recent matches found</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <BatchLoadingIndicator
        currentBatch={batchProgress.currentBatch}
        totalBatches={batchProgress.totalBatches}
        currentMatch={batchProgress.currentMatch}
        totalMatches={batchProgress.totalMatches}
        isVisible={batchProgress.isVisible}
      />

      <div className="space-y-4 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">
            Recent Matches
            {totalLoaded > initialMatches.length && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({totalLoaded} loaded{hasMore ? ", more available" : ""})
              </span>
            )}
          </h2>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Export Button - now exports all loaded matches */}
            <ExportButton matches={filteredMatches} puuid={puuid} summonerName={summonerName} />

            {/* Queue Type Filter */}
            <div className="flex-1 md:flex-none md:w-48">
              <Select value={queueFilter} onValueChange={handleQueueFilterChange}>
                <SelectTrigger className="w-full">
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

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search players in matches..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Queue Type Filter Badges (Mobile) */}
        <div className="flex flex-wrap gap-2 md:hidden">
          {QUEUE_CATEGORIES.map((category) => (
            <Badge
              key={category.id}
              variant={queueFilter === category.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setQueueFilter(category.id)}
            >
              {category.name} {queueCounts[category.id] > 0 && `(${queueCounts[category.id]})`}
            </Badge>
          ))}
        </div>

        {/* Filter Status Messages */}
        {(searchTerm || queueFilter !== "all") && (
          <div className="bg-gray-100 rounded-md p-2 text-sm">
            {filteredMatches.length === 0 ? (
              <p>No matches found with the current filters</p>
            ) : (
              <p>
                Showing {filteredMatches.length} of {totalMatches} matches
                {queueFilter !== "all" && ` in ${QUEUE_CATEGORIES.find((c) => c.id === queueFilter)?.name}`}
                {searchTerm && ` with player "${searchTerm}"`}
              </p>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry} disabled={isLoading} className="ml-4">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-md shadow-md">
              <p className="text-gray-500">No matches found with the current filters</p>
              <div className="flex justify-center gap-2 mt-4">
                {searchTerm && (
                  <Button variant="outline" onClick={clearSearch}>
                    Clear search
                  </Button>
                )}
                {queueFilter !== "all" && (
                  <Button variant="outline" onClick={() => setQueueFilter("all")}>
                    Show all queue types
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.metadata.matchId}
                  match={match}
                  puuid={puuid}
                  staticData={staticData}
                  searchTerm={searchTerm}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center py-6">
                  {isLoading ? (
                    <MatchesLoading showHeader={false} count={2} />
                  ) : (
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      Load More Matches
                      <span className="text-sm text-gray-500">({totalLoaded} loaded)</span>
                    </Button>
                  )}
                </div>
              )}

              {/* End of matches indicator */}
              {!hasMore && totalLoaded > initialMatches.length && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    You've reached the end of the match history ({totalLoaded} matches total)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
