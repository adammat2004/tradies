import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// GET: list exceptions
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const listingId = url.searchParams.get("listingId");
    if (!listingId) return NextResponse.json({ exceptions: [] }, { status: 200 });
    const exceptions = await prisma.availabilityException.findMany({
      where: { listingId },
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json({ exceptions }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


