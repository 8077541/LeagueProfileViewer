import { NextResponse } from "next/server"
import { getStaticData } from "@/lib/riot"

export async function GET() {
  try {
    const staticData = await getStaticData()
    return NextResponse.json(staticData)
  } catch (error: any) {
    console.error("API Error fetching static data:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch static data" }, { status: 500 })
  }
}
