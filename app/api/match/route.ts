// app/api/match/route.ts
import { NextResponse } from "next/server"
import { matchListings } from "@/app/actions/matchListings"

export async function POST(req: Request) {
  try {
    const { description, county, limit } = await req.json()
    const matches = await matchListings({ description, county, limit })
    return NextResponse.json({ matches })
  } catch (e: any) {
    console.error("Match error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
