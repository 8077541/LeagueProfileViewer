"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

export function SearchForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [tag, setTag] = useState("")
  const [region, setRegion] = useState("euw1")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add this effect to store loading state in sessionStorage
  // This ensures the loading state persists during navigation
  useEffect(() => {
    // Check if we're coming back from a navigation
    const storedLoading = sessionStorage.getItem("profileSearchLoading")
    if (storedLoading === "true") {
      // Clear the loading state
      sessionStorage.removeItem("profileSearchLoading")
    }

    // Cleanup loading state when component unmounts
    return () => {
      if (isLoading) {
        sessionStorage.removeItem("profileSearchLoading")
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username) {
      setError("Please enter a summoner name")
      return
    }

    if (!tag) {
      setError("Please enter a tag")
      return
    }

    setIsLoading(true)

    // Add a small delay to ensure the loading state is visible
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Store loading state in sessionStorage before navigation
    sessionStorage.setItem("profileSearchLoading", "true")
    router.push(`/${region}/${encodeURIComponent(username)}/${tag}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">Summoner Name</Label>
        <Input
          id="username"
          placeholder="Enter summoner name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag">Tag</Label>
        <Input
          id="tag"
          placeholder="Enter tag (e.g. EUW)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger id="region">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="br1">BR</SelectItem>
            <SelectItem value="eun1">EUNE</SelectItem>
            <SelectItem value="euw1">EUW</SelectItem>
            <SelectItem value="jp1">JP</SelectItem>
            <SelectItem value="kr">KR</SelectItem>
            <SelectItem value="la1">LAN</SelectItem>
            <SelectItem value="la2">LAS</SelectItem>
            <SelectItem value="na1">NA</SelectItem>
            <SelectItem value="oc1">OCE</SelectItem>
            <SelectItem value="tr1">TR</SelectItem>
            <SelectItem value="ru">RU</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 w-full">
            <Spinner size="sm" className="border-t-white" />
            <span>Loading...</span>
          </div>
        ) : (
          "Search"
        )}
      </Button>
    </form>
  )
}
