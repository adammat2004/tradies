import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// Helper: ensure the listing belongs to current user
async function getOwnedListingId(userId: string, req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) {
    // fallback: user’s first listing (matches your current frontend behavior)
    const first = await prisma.listing.findFirst({
      where: { userId },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    return first?.id ?? null;
  }
  const owned = await prisma.listing.findFirst({ where: { id: listingId, userId }, select: { id: true } });
  return owned?.id ?? null;
}

// GET: list rules for listing
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = currentUser.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const listingId = await getOwnedListingId(userId, req);
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

/**
 * POST: replace weekly rules
 * Body:
 * {
 *   listingId?: string, // optional; if omitted we use user’s first listing
 *   rules: Array<{ rrule: string; startTime: string; endTime: string; timezone: string; }>
 * }
 */
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = currentUser.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const qpListingId = url.searchParams.get("listingId");

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { rules = [], listingId: bodyListingId } = body as {
      listingId?: string;
      rules?: Array<{ rrule: string; startTime: string; endTime: string; timezone: string }>;
    };

    const targetListingId =
      (bodyListingId as string | undefined) ??
      (qpListingId as string | undefined) ??
      (await (async () => {
        const first = await prisma.listing.findFirst({
          where: { userId },
          select: { id: true },
          orderBy: { createdAt: "asc" },
        });
        return first?.id;
      })());

    if (!targetListingId) {
      return NextResponse.json({ error: "No valid listing for user" }, { status: 400 });
    }

    // ownership check
    const owned = await prisma.listing.findFirst({
      where: { id: targetListingId, userId },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // basic validation
    const cleaned = (Array.isArray(rules) ? rules : []).map((r) => ({
      rrule: String(r?.rrule ?? "").trim(),
      startTime: String(r?.startTime ?? "").trim(),
      endTime: String(r?.endTime ?? "").trim(),
      timezone: String(r?.timezone ?? "").trim(),
    }));

    if (cleaned.some((r) => !r.rrule || !r.startTime || !r.endTime || !r.timezone)) {
      return NextResponse.json({ error: "Each rule must include rrule, startTime, endTime, timezone" }, { status: 400 });
    }

    // replace rules in a transaction
    const txResult = await prisma.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany({ where: { listingId: targetListingId } });
      if (cleaned.length === 0) return [];
      const created = await tx.availabilityRule.createMany({
        data: cleaned.map((r) => ({ ...r, listingId: targetListingId })),
      });
      // Return the inserted rows with a follow-up query (createMany doesn’t return rows)
      return tx.availabilityRule.findMany({ where: { listingId: targetListingId }, orderBy: { rrule: "asc" } });
    });

    return NextResponse.json({ rules: txResult }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
