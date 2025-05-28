import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to decode URL-encoded strings for display
export function decodeDisplayName(encodedName: string): string {
  try {
    return decodeURIComponent(encodedName)
  } catch (error) {
    // If decoding fails, return the original string
    return encodedName
  }
}

// Utility function to format summoner name for display
export function formatSummonerName(name: string, tag?: string): string {
  const decodedName = decodeDisplayName(name)
  return tag ? `${decodedName}#${tag}` : decodedName
}

// Utility function to capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Utility function to format region display
export function formatRegionDisplay(region: string): string {
  const regionMap: Record<string, string> = {
    br1: "BR",
    eun1: "EUNE",
    euw1: "EUW",
    jp1: "JP",
    kr: "KR",
    la1: "LAN",
    la2: "LAS",
    na1: "NA",
    oc1: "OCE",
    tr1: "TR",
    ru: "RU",
  }

  return regionMap[region.toLowerCase()] || region.toUpperCase()
}
