// app/api/provider/services/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
type Body = {
  listingId?: string;            // REQUIRED (from your frontend)
  name?: string;
  description?: string;
  durationMin?: number;
  pricingModel?: "hourly" | "quote_only";
  hourlyRate?: number | null;
  calloutFee?: number | null;
  // Optional extras supported by your schema:
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
  minNoticeMin?: number;
  maxNoticeDays?: number;
  priceFrom?: number | null;
};

export async function POST(req: Request) {
  try {
    // ---- Auth ----
    const user = await getCurrentUser();
    const userId = user?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ---- Parse & validate body ----
    const body = (await req.json()) as Body;
    const {
      listingId,
      name,
      description = "",
      durationMin = 60,
      pricingModel,
      hourlyRate = null,
      calloutFee = null,
      bufferBeforeMin,
      bufferAfterMin,
      minNoticeMin,
      maxNoticeDays,
      priceFrom,
    } = body || {};

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const safeDuration =
      Number.isFinite(durationMin) && (durationMin as number) > 0
        ? Math.max(15, Math.floor(durationMin as number))
        : 60;

    if (pricingModel === "hourly") {
      if (hourlyRate == null || typeof hourlyRate !== "number" || hourlyRate <= 0) {
        return NextResponse.json(
          { error: "hourlyRate must be a positive number when pricingModel is 'hourly'" },
          { status: 400 }
        );
      }
    }

    // ---- Ownership check: listing must belong to current user ----
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, userId },
      select: { id: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ---- Create service ----
    const service = await prisma.service.create({
      data: {
        listingId,
        name: name.trim(),
        description: description || "",
        durationMin: safeDuration,
        pricingModel: pricingModel,
        hourlyRate: pricingModel === "hourly" ? (hourlyRate as number) : null,
        calloutFee: calloutFee == null ? null : Number(calloutFee),

        // Optional fields (fallbacks are enforced by Prisma defaults if undefined)
        bufferBeforeMin: typeof bufferBeforeMin === "number" ? Math.max(0, Math.floor(bufferBeforeMin)) : undefined,
        bufferAfterMin: typeof bufferAfterMin === "number" ? Math.max(0, Math.floor(bufferAfterMin)) : undefined,
        minNoticeMin: typeof minNoticeMin === "number" ? Math.max(0, Math.floor(minNoticeMin)) : undefined,
        maxNoticeDays: typeof maxNoticeDays === "number" ? Math.max(0, Math.floor(maxNoticeDays)) : undefined,
        priceFrom: priceFrom == null ? null : Number(priceFrom),
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
