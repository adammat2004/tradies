import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET: list rules for listing
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const listingId = url.searchParams.get("listingId");
    if (!listingId) return NextResponse.json({ rules: [] }, { status: 200 });

    const rules = await prisma.availabilityRule.findMany({
      where: { listingId },
      orderBy: { rrule: "asc" },
    });

    return NextResponse.json({ rules }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
