import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// Helper: ensure the listing belongs to current user
async function getOwnedListingId(userId: string, req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) {
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

// GET: list exceptions
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const listingId = await getOwnedListingId(currentUser.id, req);
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

/**
 * POST: add a time-off (or open) exception
 * Body:
 * {
 *   listingId?: string, // optional; if omitted uses user’s first listing
 *   startAt: string | Date, // ISO
 *   endAt: string | Date,   // ISO
 *   type?: "block" | "open" (default "block")
 *   reason?: string
 * }
 */
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const qpListingId = url.searchParams.get("listingId");

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      listingId: bodyListingId,
      startAt,
      endAt,
      type = "block",
      reason = "",
    } = body as {
      listingId?: string;
      startAt?: string | Date;
      endAt?: string | Date;
      type?: string;
      reason?: string;
    };

    const listingId =
      (bodyListingId as string | undefined) ??
      (qpListingId as string | undefined) ??
      (await (async () => {
        const first = await prisma.listing.findFirst({
          where: { userId: currentUser.id },
          select: { id: true },
          orderBy: { createdAt: "asc" },
        });
        return first?.id;
      })());

    if (!listingId) return NextResponse.json({ error: "No valid listing for user" }, { status: 400 });

    // Ownership check
    const owned = await prisma.listing.findFirst({ where: { id: listingId, userId: currentUser.id }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const start = new Date(String(startAt ?? ""));
    const end = new Date(String(endAt ?? ""));
    if (!isFinite(start.getTime()) || !isFinite(end.getTime())) {
      return NextResponse.json({ error: "startAt and endAt must be valid ISO datetimes" }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json({ error: "endAt must be after startAt" }, { status: 400 });
    }
    const t = String(type);
    if (t !== "block" && t !== "open") {
      return NextResponse.json({ error: "type must be 'block' or 'open'" }, { status: 400 });
    }

    const ex = await prisma.availabilityException.create({
      data: {
        listingId,
        startAt: start,
        endAt: end,
        type: t,
        reason: reason || "",
      },
    });

    return NextResponse.json({ exception: ex }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: /api/provider/availability/exceptions?id=<exceptionId>
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Ensure the exception belongs to a listing owned by the user
    const ex = await prisma.availabilityException.findUnique({
      where: { id },
      select: { id: true, listingId: true },
    });
    if (!ex) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owns = await prisma.listing.findFirst({
      where: { id: ex.listingId, userId: currentUser.id },
      select: { id: true },
    });
    if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.availabilityException.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
