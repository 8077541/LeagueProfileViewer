// lib/cache.ts

// Define cache keys
export const CACHE_KEYS = {
  SUMMONER: (region: string, name: string, tag: string) => `summoner_${region}_${name}_${tag}`,
  LEAGUE_ENTRIES: (summonerId: string, region: string) => `league_entries_${summonerId}_${region}`,
  MATCH_IDS: (puuid: string, region: string) => `match_ids_${puuid}_${region}`,
  MATCH: (matchId: string) => `match_${matchId}`,
  STATIC_DATA: "static_data",
}

// Define cache expiry times in milliseconds
export const CACHE_EXPIRY = {
  SUMMONER: 60 * 60 * 1000, // 1 hour
  LEAGUE_ENTRIES: 60 * 60 * 1000, // 1 hour
  MATCH_IDS: 5 * 60 * 1000, // 5 minutes
  MATCH: 60 * 60 * 1000 * 24, // 24 hours
  STATIC_DATA: 60 * 60 * 1000 * 24 * 7, // 7 days
}

// Function to get data from localStorage
export function getFromCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (item) {
      const cacheItem = JSON.parse(item)
      if (Date.now() > cacheItem.expiry) {
        localStorage.removeItem(key)
        return null
      }
      return cacheItem.data as T
    }
    return null
  } catch (error) {
    return null
  }
}

// Function to set data in localStorage
export function setInCache<T>(key: string, data: T, expiry: number): void {
  try {
    const cacheItem = {
      data,
      expiry: Date.now() + expiry,
    }
    localStorage.setItem(key, JSON.stringify(cacheItem))
  } catch (error) {}
}
