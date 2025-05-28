"use client"

import { useState, useCallback } from "react"

interface UseMatchPaginationProps {
  region: string
  puuid: string
  staticData: any
  initialMatches?: any[]
}

interface UseMatchPaginationReturn {
  matches: any[]
  isLoading: boolean
  hasMore: boolean
  error: string | null
  loadMore: () => Promise<void>
  totalLoaded: number
}

export function useMatchPagination({
  region,
  puuid,
  staticData,
  initialMatches = [],
}: UseMatchPaginationProps): UseMatchPaginationReturn {
  const [matches, setMatches] = useState<any[]>(initialMatches)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      // Calculate the start index for the next batch
      const start = matches.length
      const count = 10 // Load 10 more matches at a time

      // Call our API route instead of directly calling Riot API
      const response = await fetch(
        `/api/matches?region=${encodeURIComponent(region)}&puuid=${encodeURIComponent(puuid)}&start=${start}&count=${count}`,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.matches.length === 0) {
        setHasMore(false)
        return
      }

      // Add new matches to the existing list
      setMatches((prevMatches) => [...prevMatches, ...data.matches])

      // Update hasMore based on API response
      setHasMore(data.hasMore)

      if (data.errors && data.errors.length > 0) {
        // console.warn(`Failed to load ${data.errors.length} matches:`, data.errors)
      }

      // console.log(`Successfully loaded ${data.matches.length} additional matches`)
    } catch (err: any) {
      console.error("Error loading more matches:", err)
      setError(err.message || "Failed to load more matches")
    } finally {
      setIsLoading(false)
    }
  }, [region, puuid, matches.length, isLoading, hasMore])

  return {
    matches,
    isLoading,
    hasMore,
    error,
    loadMore,
    totalLoaded: matches.length,
  }
}
