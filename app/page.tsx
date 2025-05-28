"use client"

import { SearchForm } from "@/components/search-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { formatRegionDisplay } from "@/lib/utils"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)

  // Check if we're coming back from a search
  useEffect(() => {
    const storedLoading = sessionStorage.getItem("profileSearchLoading")
    if (storedLoading === "true") {
      setIsLoading(true)
    }

    // Listen for page visibility changes to clear loading state
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sessionStorage.removeItem("profileSearchLoading")
        setIsLoading(false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const exampleProfiles = [
    { name: "memento mori", tag: "echo", region: "eun1", regionDisplay: formatRegionDisplay("eun1") },
    { name: "Ajvi", tag: "xyz", region: "euw1", regionDisplay: formatRegionDisplay("euw1") },
    { name: "cant type", tag: "1998", region: "na1", regionDisplay: formatRegionDisplay("na1") },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">League Profile Viewer</h1>
          <p className="text-gray-500">Enter a summoner name, tag, and region to view their profile</p>
        </div>

        {isLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Spinner size="xl" />
              <div className="text-center">
                <p className="text-lg font-medium">Loading profile...</p>
                <p className="text-sm text-gray-500">Please wait while we fetch the summoner data</p>
              </div>
            </div>
          </div>
        ) : (
          <SearchForm />
        )}

        {/* Example Profiles Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700">Try these example profiles</h2>
            <p className="text-sm text-gray-500">Click on any profile to see it in action</p>
          </div>

          <div className="space-y-2">
            {exampleProfiles.map((profile) => (
              <Button
                key={`${profile.name}-${profile.tag}-${profile.region}`}
                variant="outline"
                className="w-full justify-between group hover:bg-blue-50 hover:border-blue-300 transition-colors"
                asChild
              >
                <Link href={`/${profile.region}/${encodeURIComponent(profile.name)}/${profile.tag}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile.name}</span>
                    <span className="text-gray-500">#{profile.tag}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{profile.regionDisplay}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            ))}
          </div>

          <div className="text-center text-xs text-gray-400 mt-4">
            <p>These are real player profiles used for demonstration purposes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
