// Queue type mapping
export const QUEUE_TYPES: Record<number, string> = {
  400: "Normal Draft",
  420: "Ranked Solo/Duo",
  430: "Normal Blind",
  440: "Ranked Flex",
  450: "ARAM",
  700: "Clash",
  830: "Co-op vs AI (Intro)",
  840: "Co-op vs AI (Beginner)",
  850: "Co-op vs AI (Intermediate)",
  900: "URF",
  1020: "One for All",
  1300: "Nexus Blitz",
  1400: "Ultimate Spellbook",
  1900: "URF",
  2000: "Tutorial 1",
  2010: "Tutorial 2",
  2020: "Tutorial 3",
}

// Queue type categories for filtering
export const QUEUE_CATEGORIES = [
  { id: "all", name: "All Games" },
  { id: "ranked", name: "Ranked Games", queueIds: [420, 440] },
  { id: "normal", name: "Normal Games", queueIds: [400, 430] },
  { id: "aram", name: "ARAM", queueIds: [450] },
  { id: "special", name: "Special Modes", queueIds: [700, 900, 1020, 1300, 1400, 1900] },
]

// Get queue type name from queue ID
export function getQueueTypeName(queueId: number): string {
  return QUEUE_TYPES[queueId] || "Custom Game"
}

// Check if a queue ID belongs to a category
export function isQueueInCategory(queueId: number, categoryId: string): boolean {
  if (categoryId === "all") return true

  const category = QUEUE_CATEGORIES.find((cat) => cat.id === categoryId)
  return category ? category.queueIds?.includes(queueId) || false : false
}
