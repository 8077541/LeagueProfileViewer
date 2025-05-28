"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Client-side error:", error)
    }
  }, [error])

  // Check if the error is related to the Riot API
  const isRiotApiError =
    error.message.includes("fetch") && (error.message.includes("summoner") || error.message.includes("account"))

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="text-4xl font-bold">Something went wrong</h1>

        {isRiotApiError ? (
          <>
            <p className="text-gray-700">There was an error connecting to the Riot API.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-left text-sm text-amber-800">
              <p className="font-medium">Possible reasons:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>The Riot API key may be invalid or expired</li>
                <li>The summoner name or tag may be incorrect</li>
                <li>The Riot API may be experiencing issues</li>
                <li>Rate limits may have been exceeded</li>
              </ul>
            </div>
          </>
        ) : (
          <p className="text-gray-500">There was an error loading the summoner profile.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
          <Button asChild>
            <Link href="/">Return to Search</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
