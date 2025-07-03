// Mapping of region codes to regional routing values
const REGION_ROUTING: Record<string, string> = {
  br1: "americas",
  eun1: "europe",
  euw1: "europe",
  jp1: "asia",
  kr: "asia",
  la1: "americas",
  la2: "americas",
  na1: "americas",
  oc1: "sea",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tr1: "europe",
  ru: "europe",
  vn2: "sea",
}

// Base URLs for different Riot APIs
const BASE_URLS = {
  // Account v1 API - Regional routes
  account: (region: string) => {
    const routing = REGION_ROUTING[region] || "europe"
    return `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id`
  },
  // Summoner v4 API - Platform routes
  summoner: (region: string) => `https://${region}.api.riotgames.com/lol/summoner/v4/summoners`,
  summonerByName: (region: string) => `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name`,
  // League v4 API - Platform routes (FIXED: using by-puuid instead of by-summoner)
  league: (region: string) => `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid`,
  leagueBySummoner: (region: string) => `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner`,
  // Match v5 API - Regional routes
  matches: (region: string) => {
    const routing = REGION_ROUTING[region] || "europe"
    return `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid`
  },
  match: (region: string) => {
    const routing = REGION_ROUTING[region] || "europe"
    return `https://${routing}.api.riotgames.com/lol/match/v5/matches`
  },
}

// DataDragon URLs for static data
export const DATA_DRAGON = {
  champions: "https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/champion.json",
  items: "https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/item.json",
  runes: "https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/runesReforged.json",
  summonerSpells: "https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/summoner.json",
  profileIcon: (iconId: number) => `https://ddragon.leagueoflegends.com/cdn/15.10.1/img/profileicon/${iconId}.png`,
  championIcon: (championId: string) =>
    `https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/${championId}.png`,
  itemIcon: (itemId: number) => `https://ddragon.leagueoflegends.com/cdn/15.10.1/img/item/${itemId}.png`,
  summonerSpellIcon: (spellId: string) => `https://ddragon.leagueoflegends.com/cdn/15.10.1/img/spell/${spellId}.png`,
  rankEmblem: (tier: string) => {
    // Convert tier to lowercase for URL
    const formattedTier = tier ? tier.toLowerCase() : "unranked"
    return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${formattedTier}.png`
  },
}

// Import cache utilities
import { getFromCache, setInCache, CACHE_KEYS, CACHE_EXPIRY } from "@/lib/cache"

// API Key management
const API_KEYS = [process.env.RIOT_API_KEY || "", process.env.RIOT_API_KEY_2 || ""].filter((key) => key.length > 0)

// Rate limit tracking per region per API key
interface RateLimitTracker {
  requests: number[] // Array of request timestamps
  currentKeyIndex: number
  lastReset: number
}

const rateLimitTrackers: Record<string, RateLimitTracker> = {}

// Rate limit constants (actual Riot API limits)
const RATE_LIMITS = {
  SHORT_TERM: { requests: 20, window: 1000 }, // 20 requests per 1 second
  LONG_TERM: { requests: 100, window: 120000 }, // 100 requests per 2 minutes
}

// Get rate limit tracker for a region
function getRateLimitTracker(region: string): RateLimitTracker {
  if (!rateLimitTrackers[region]) {
    rateLimitTrackers[region] = {
      requests: [],
      currentKeyIndex: 0,
      lastReset: Date.now(),
    }
  }
  return rateLimitTrackers[region]
}

// Clean old requests from tracker
function cleanOldRequests(tracker: RateLimitTracker) {
  const now = Date.now()
  // Remove requests older than 2 minutes (our longest window)
  tracker.requests = tracker.requests.filter((timestamp) => now - timestamp < RATE_LIMITS.LONG_TERM.window)
}

// Check if we can make a request with current API key
function canMakeRequest(region: string): boolean {
  const tracker = getRateLimitTracker(region)
  cleanOldRequests(tracker)

  const now = Date.now()

  // Check short term limit (1 second)
  const recentRequests = tracker.requests.filter((timestamp) => now - timestamp < RATE_LIMITS.SHORT_TERM.window)
  if (recentRequests.length >= RATE_LIMITS.SHORT_TERM.requests) {
    return false
  }

  // Check long term limit (2 minutes)
  if (tracker.requests.length >= RATE_LIMITS.LONG_TERM.requests) {
    return false
  }

  return true
}

// Get next available API key for region
function getNextApiKey(region: string): { key: string; keyIndex: number } | null {
  if (API_KEYS.length === 0) {
    throw new Error("No API keys configured")
  }

  const tracker = getRateLimitTracker(region)

  // Try current key first
  if (canMakeRequest(region)) {
    return {
      key: API_KEYS[tracker.currentKeyIndex],
      keyIndex: tracker.currentKeyIndex,
    }
  }

  // Try other keys
  for (let i = 0; i < API_KEYS.length; i++) {
    if (i !== tracker.currentKeyIndex) {
      // Temporarily switch to this key to check its limits
      const originalIndex = tracker.currentKeyIndex
      tracker.currentKeyIndex = i

      if (canMakeRequest(region)) {
        return {
          key: API_KEYS[i],
          keyIndex: i,
        }
      }

      // Restore original index if this key is also rate limited
      tracker.currentKeyIndex = originalIndex
    }
  }

  return null // All keys are rate limited
}

// Record a request for rate limiting
function recordRequest(region: string, keyIndex: number) {
  const tracker = getRateLimitTracker(region)
  tracker.currentKeyIndex = keyIndex
  tracker.requests.push(Date.now())
  cleanOldRequests(tracker)
}

// Calculate wait time until we can make a request
function getWaitTime(region: string): number {
  const tracker = getRateLimitTracker(region)
  cleanOldRequests(tracker)

  const now = Date.now()

  // Check short term limit
  const recentRequests = tracker.requests.filter((timestamp) => now - timestamp < RATE_LIMITS.SHORT_TERM.window)
  if (recentRequests.length >= RATE_LIMITS.SHORT_TERM.requests) {
    const oldestRecent = Math.min(...recentRequests)
    return RATE_LIMITS.SHORT_TERM.window - (now - oldestRecent) + 100 // Add 100ms buffer
  }

  // Check long term limit
  if (tracker.requests.length >= RATE_LIMITS.LONG_TERM.requests) {
    const oldestRequest = Math.min(...tracker.requests)
    return RATE_LIMITS.LONG_TERM.window - (now - oldestRequest) + 100 // Add 100ms buffer
  }

  return 0
}

// Helper function to handle API responses with improved rate limit handling
async function handleApiResponse(response: Response, errorPrefix: string, region: string) {
  if (!response.ok) {
    const status = response.status
    let errorMessage = `${errorPrefix}: ${status}`

    // Special handling for rate limit errors
    if (status === 429) {
      const retryAfter = response.headers.get("Retry-After")
      const retryAfterMs = retryAfter ? Number.parseInt(retryAfter) * 1000 : 1000

      errorMessage = `${errorPrefix}: ${status} - rate limit exceeded`
      if (retryAfter) {
        errorMessage += ` (retry after ${retryAfter}s)`
      }

      // Force a longer wait for this region
      const tracker = getRateLimitTracker(region)
      tracker.requests.push(Date.now() + retryAfterMs)
    } else {
      try {
        // Try to get more detailed error information
        const errorData = await response.json()
        if (errorData && errorData.status && errorData.status.message) {
          errorMessage += ` - ${errorData.status.message}`
        }
      } catch (e) {
        // If we can't parse the error as JSON, just use the status
      }
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Make API request with rate limiting and key rotation
async function makeApiRequest(url: string, region: string, retries = 2): Promise<any> {
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Get available API key
      const apiKeyInfo = getNextApiKey(region)

      if (!apiKeyInfo) {
        // All keys are rate limited, wait for the shortest time
        const waitTime = getWaitTime(region)
        if (waitTime > 0) {
          await delay(waitTime)
          continue // Try again after waiting
        }
      }

      if (!apiKeyInfo) {
        throw new Error("No available API keys")
      }

      // Record the request
      recordRequest(region, apiKeyInfo.keyIndex)

      // Make the request
      const response = await fetch(url, {
        headers: {
          "X-Riot-Token": apiKeyInfo.key,
        },
      })

      if (response.status === 429) {
        // Rate limit hit, try next key on next attempt
        const tracker = getRateLimitTracker(region)
        tracker.currentKeyIndex = (tracker.currentKeyIndex + 1) % API_KEYS.length

        const retryAfter = response.headers.get("Retry-After")
        const waitTime = retryAfter ? Number.parseInt(retryAfter) * 1000 : 1000

        lastError = new Error(`Rate limit exceeded for region ${region}`)

        if (attempt < retries) {
          await delay(waitTime)
          continue
        }
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        // Server error, wait and retry
        lastError = new Error(`Server error ${response.status} for region ${region}`)

        if (attempt < retries) {
          await delay(1000)
          continue
        }
      }

      return handleApiResponse(response, "API request failed", region)
    } catch (error) {
      console.error(`API request error (attempt ${attempt + 1}):`, error)
      lastError = error

      if (attempt < retries) {
        await delay(500)
      }
    }
  }

  throw lastError
}

// Get summoner data by riot ID (name + tag)
export async function getSummonerByRiotId(region: string, name: string, tag: string) {
  try {
    console.log(`🔍 [getSummonerByRiotId] Starting lookup for ${name}#${tag} in region ${region}`)

    // Check cache first
    const cacheKey = CACHE_KEYS.SUMMONER(region, name, tag)
    const cachedData = getFromCache<any>(cacheKey)
    if (cachedData) {
      console.log(`✅ [getSummonerByRiotId] Found cached data for ${name}#${tag}`)
      console.log(`📊 [getSummonerByRiotId] Cached summoner data:`, {
        id: cachedData.id,
        puuid: cachedData.puuid,
        name: cachedData.name,
        gameName: cachedData.gameName,
        tagLine: cachedData.tagLine,
        summonerLevel: cachedData.summonerLevel,
      })
      return cachedData
    }

    // First, get the Riot account using the account-v1 API (regional routing)
    const accountUrl = `${BASE_URLS.account(region)}/${name}/${tag}`
    console.log(`🌐 [getSummonerByRiotId] Fetching account data from: ${accountUrl}`)

    const accountData = await makeApiRequest(accountUrl, region)
    console.log(`✅ [getSummonerByRiotId] Account data received:`, {
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
    })

    // Then, use the PUUID to get the summoner data (platform routing)
    const summonerUrl = `${BASE_URLS.summoner(region)}/by-puuid/${accountData.puuid}`
    console.log(`🌐 [getSummonerByRiotId] Fetching summoner data from: ${summonerUrl}`)

    const summonerData = await makeApiRequest(summonerUrl, region)
    console.log(`✅ [getSummonerByRiotId] Summoner data received:`, {
      id: summonerData.id,
      accountId: summonerData.accountId,
      puuid: summonerData.puuid,
      name: summonerData.name,
      profileIconId: summonerData.profileIconId,
      summonerLevel: summonerData.summonerLevel,
    })

    // Combine the data
    const combinedData = {
      ...summonerData,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
    }

    console.log(`📊 [getSummonerByRiotId] Final combined data:`, {
      id: combinedData.id,
      puuid: combinedData.puuid,
      name: combinedData.name,
      gameName: combinedData.gameName,
      tagLine: combinedData.tagLine,
      summonerLevel: combinedData.summonerLevel,
    })

    // Cache the result
    setInCache(cacheKey, combinedData, CACHE_EXPIRY.SUMMONER)
    console.log(`💾 [getSummonerByRiotId] Data cached with key: ${cacheKey}`)

    return combinedData
  } catch (error) {
    console.error(`❌ [getSummonerByRiotId] Error for ${name}#${tag} in region ${region}:`, error)
    throw error
  }
}

// Alternative method: Get summoner directly by name (for legacy support)
export async function getSummonerByName(region: string, name: string) {
  try {
    return await makeApiRequest(`${BASE_URLS.summonerByName(region)}/${encodeURIComponent(name)}`, region)
  } catch (error) {
    console.error("Error in getSummonerByName:", error)
    throw error
  }
}

// Get league entries for a summoner using PUUID (FIXED)
export async function getLeagueEntries(region: string, puuid: string) {
  console.log(`🏆 [getLeagueEntries] Requesting ranked data (puuid=${puuid}, region=${region})`)

  const cacheKey = CACHE_KEYS.LEAGUE_ENTRIES(puuid, region)
  const cached = getFromCache<any[]>(cacheKey)
  if (cached) {
    console.log(`✅ [getLeagueEntries] Served from cache (${cached.length} entries)`)
    return cached
  }

  try {
    // FIXED: Use by-puuid endpoint instead of by-summoner
    const url = `${BASE_URLS.league(region)}/${puuid}`
    console.log(`🌐 [getLeagueEntries] Fetching ranked data from: ${url}`)

    const data = await makeApiRequest(url, region)

    console.log(`✅ [getLeagueEntries] Ranked data received:`, {
      count: data.length,
      entries: data.map((entry: any) => ({
        queueType: entry.queueType,
        tier: entry.tier,
        rank: entry.rank,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
      })),
    })

    // normal successful path
    setInCache(cacheKey, data, CACHE_EXPIRY.LEAGUE_ENTRIES)
    console.log(`💾 [getLeagueEntries] Stored ${data.length} entries in cache`)
    return data
  } catch (err: any) {
    const msg = String(err?.message || err)
    console.error(`❌ [getLeagueEntries] ${msg}`)

    // Gracefully degrade on 403 (forbidden key / private data) or 404 (no ranked)
    if (msg.includes("403") || msg.includes("404")) {
      console.warn(
        `⚠️ [getLeagueEntries] Returning empty ranked data because endpoint responded with ${
          msg.includes("403") ? "403" : "404"
        }`,
      )
      return []
    }

    // any other error should propagate
    throw err
  }
}

// Get match IDs for a player with improved rate limiting and pagination support
export async function getMatchIds(region: string, puuid: string, count = 20, start = 0) {
  // Check cache first - use start parameter in cache key for pagination
  const cacheKey = `${CACHE_KEYS.MATCH_IDS(puuid, region)}_${start}_${count}`
  const cachedData = getFromCache<string[]>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    const data = await makeApiRequest(`${BASE_URLS.matches(region)}/${puuid}/ids?start=${start}&count=${count}`, region)

    // Cache the result with pagination parameters
    setInCache(cacheKey, data, CACHE_EXPIRY.MATCH_IDS)

    return data
  } catch (error) {
    console.error("Error in getMatchIds:", error)
    throw error
  }
}

// Get match details with improved rate limiting
export async function getMatchDetails(region: string, matchId: string) {
  // Check cache first
  const cacheKey = CACHE_KEYS.MATCH(matchId)
  const cachedData = getFromCache<any>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    const data = await makeApiRequest(`${BASE_URLS.match(region)}/${matchId}`, region)

    // Cache the result
    setInCache(cacheKey, data, CACHE_EXPIRY.MATCH)

    return data
  } catch (error) {
    console.error(`Error in getMatchDetails for match ${matchId}:`, error)
    throw error
  }
}

// Progress callback type
export type ProgressCallback = (current: number, total: number, batchCurrent: number, batchTotal: number) => void

// Get match details in batches with improved rate limiting and progress tracking
export async function getMatchDetailsInBatches(
  region: string,
  matchIds: string[],
  batchSize = 8,
  onProgress?: ProgressCallback,
) {
  const matches = []
  const errors = []
  const cachedMatches = []
  const uncachedMatchIds = []

  // First, check which matches are already cached
  for (const matchId of matchIds) {
    const cacheKey = CACHE_KEYS.MATCH(matchId)
    const cachedData = getFromCache<any>(cacheKey)
    if (cachedData) {
      cachedMatches.push(cachedData)
    } else {
      uncachedMatchIds.push(matchId)
    }
  }

  const totalBatches = Math.ceil(uncachedMatchIds.length / batchSize)
  let processedMatches = cachedMatches.length

  // Process uncached matchIds in batches
  for (let i = 0; i < uncachedMatchIds.length; i += batchSize) {
    const batch = uncachedMatchIds.slice(i, i + batchSize)
    const currentBatch = Math.floor(i / batchSize) + 1

    // Call progress callback for batch start
    if (onProgress) {
      onProgress(processedMatches, matchIds.length, currentBatch, totalBatches)
    }

    // Process each match in the batch with minimal delay
    const batchPromises = batch.map(async (id, index) => {
      try {
        // Small stagger to avoid hitting short-term rate limit
        if (index > 0) {
          await delay(100) // 100ms between requests in batch
        }
        const result = await getMatchDetails(region, id)

        // Update progress for each completed match
        processedMatches++
        if (onProgress) {
          onProgress(processedMatches, matchIds.length, currentBatch, totalBatches)
        }

        return result
      } catch (error) {
        console.error(`Error fetching match ${id}:`, error)
        errors.push({ id, error })
        return null
      }
    })

    // Wait for the batch to complete
    const batchResults = await Promise.all(batchPromises)

    // Add successful results to matches array
    matches.push(...batchResults.filter(Boolean))

    // Small delay between batches to be safe
    if (i + batchSize < uncachedMatchIds.length) {
      await delay(200)
    }
  }

  // Combine cached and newly fetched matches
  const allMatches = [...cachedMatches, ...matches]

  return { matches: allMatches, errors }
}

// Get static data (items, runes, summoner spells)
export async function getStaticData() {
  try {
    // Check cache first
    const cacheKey = CACHE_KEYS.STATIC_DATA
    const cachedData = getFromCache<any>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const [championsRes, itemsRes, runesRes, summonerSpellsRes] = await Promise.all([
      fetch(DATA_DRAGON.champions),
      fetch(DATA_DRAGON.items),
      fetch(DATA_DRAGON.runes),
      fetch(DATA_DRAGON.summonerSpells),
    ])

    const [champions, items, runes, summonerSpells] = await Promise.all([
      championsRes.json(),
      itemsRes.json(),
      runesRes.json(),
      summonerSpellsRes.json(),
    ])

    const data = { champions, items, runes, summonerSpells }

    // Cache the result
    setInCache(cacheKey, data, CACHE_EXPIRY.STATIC_DATA)

    return data
  } catch (error) {
    console.error("Error in getStaticData:", error)
    throw error
  }
}

// Initialize cache cleanup on client side
export function initializeCache() {
  if (typeof window !== "undefined") {
    // Clear expired cache items on load
    clearExpiredCache()
  }
}

// Function to clear expired cache items
function clearExpiredCache() {
  try {
    const now = Date.now()
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      if (key.startsWith("match_") || key.startsWith("summoner_") || key.startsWith("league_entries_")) {
        const item = localStorage.getItem(key)
        if (item) {
          try {
            const cacheItem = JSON.parse(item)
            if (now > cacheItem.expiry) {
              localStorage.removeItem(key)
              i--
            }
          } catch (e) {
            // If we can't parse the item, remove it
            localStorage.removeItem(key)
            i--
          }
        }
      }
    }
  } catch (error) {
    // Keep only essential error logging for production debugging
    console.error("Error clearing expired cache:", error)
  }
}

// Debug function to check rate limit status
export function getRateLimitStatus() {
  const status: Record<string, any> = {}

  for (const [region, tracker] of Object.entries(rateLimitTrackers)) {
    cleanOldRequests(tracker)
    const now = Date.now()
    const recentRequests = tracker.requests.filter((timestamp) => now - timestamp < RATE_LIMITS.SHORT_TERM.window)

    status[region] = {
      currentKey: tracker.currentKeyIndex + 1,
      totalKeys: API_KEYS.length,
      requestsInLastSecond: recentRequests.length,
      requestsInLast2Minutes: tracker.requests.length,
      canMakeRequest: canMakeRequest(region),
      waitTime: getWaitTime(region),
    }
  }

  return status
}

// Debug function to test API endpoints
export async function debugApiEndpoints(region: string, puuid: string) {
  console.log(`🔧 [debugApiEndpoints] Testing API endpoints for PUUID ${puuid} in region ${region}`)

  // Test League endpoint with PUUID (FIXED)
  const leagueUrl = `${BASE_URLS.league(region)}/${puuid}`
  console.log(`🔧 [debugApiEndpoints] Testing League URL: ${leagueUrl}`)

  try {
    const response = await fetch(leagueUrl, {
      headers: {
        "X-Riot-Token": API_KEYS[0] || "NO_KEY",
      },
    })

    console.log(`🔧 [debugApiEndpoints] League endpoint response:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`🔧 [debugApiEndpoints] League endpoint data:`, data)
    } else {
      const errorText = await response.text()
      console.log(`🔧 [debugApiEndpoints] League endpoint error body:`, errorText)
    }
  } catch (error) {
    console.error(`🔧 [debugApiEndpoints] League endpoint fetch error:`, error)
  }

  // Test API key validity
  console.log(`🔧 [debugApiEndpoints] API Keys configured: ${API_KEYS.length}`)
  API_KEYS.forEach((key, index) => {
    console.log(`🔧 [debugApiEndpoints] API Key ${index + 1}: ${key ? `${key.substring(0, 8)}...` : "MISSING"}`)
  })
}
