// app/api/requests/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"
import getCurrentUser from "@/app/actions/getCurrentUser";

type ReqBody = {
  listingId?: string;
  serviceId?: string;
  title?: string;
  description?: string;
  address?: string;
  pictures?: string[];
  budgetMin?: number;
  budgetMax?: number;
  preferredWindows?: { start: string; end: string }[];
};

export async function POST(req: Request) {
  try {
    // ---- Auth: customer must be logged in ----
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const customerId = currentUser.id as string | undefined;
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ---- Parse body ----
    const body = (await req.json().catch(() => null)) as ReqBody | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      listingId,
      serviceId,
      title,
      description,
      address,
      pictures = [],
      budgetMin,
      budgetMax,
      preferredWindows = [],
    } = body;

    // ---- Validation ----
    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }
    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }

    // check listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // if serviceId present, ensure it belongs to that listing
    if (serviceId) {
      const svc = await prisma.service.findFirst({
        where: { id: serviceId, listingId },
        select: { id: true },
      });
      if (!svc) {
        return NextResponse.json({ error: "Service not found for this listing" }, { status: 400 });
      }
    }

    // validate windows
    const cleanedWindows =
      Array.isArray(preferredWindows) ? preferredWindows.filter(Boolean) : [];

    const windowsData = cleanedWindows
      .map((w) => {
        const s = new Date(String(w.start));
        const e = new Date(String(w.end));
        return { startAt: s, endAt: e };
      })
      .filter(({ startAt, endAt }) => isFinite(startAt.getTime()) && isFinite(endAt.getTime()) && endAt > startAt);

    if (cleanedWindows.length > 0 && windowsData.length === 0) {
      return NextResponse.json({ error: "preferredWindows contain invalid ranges" }, { status: 400 });
    }
    if (windowsData.length > 3) {
      return NextResponse.json({ error: "Up to 3 preferred windows allowed" }, { status: 400 });
    }

    // optional budget sanity
    const minOk = typeof budgetMin === "number" ? budgetMin >= 0 : true;
    const maxOk = typeof budgetMax === "number" ? budgetMax >= 0 : true;
    const orderOk = typeof budgetMin === "number" && typeof budgetMax === "number" ? budgetMax >= budgetMin : true;
    if (!minOk || !maxOk || !orderOk) {
      return NextResponse.json({ error: "Invalid budget range" }, { status: 400 });
    }

    // ---- Create request + windows (atomic) ----
    const created = await prisma.request.create({
      data: {
        listingId,
        serviceId: serviceId || null,
        customerId,
        title: title?.trim() || null,
        description: description.trim(),
        address: address?.trim() || null,
        pictures: Array.isArray(pictures) ? pictures.slice(0, 20) : [],
        budgetMin: typeof budgetMin === "number" ? budgetMin : null,
        budgetMax: typeof budgetMax === "number" ? budgetMax : null,
        status: "pending",
        windows: windowsData.length
          ? { create: windowsData.map((w) => ({ startAt: w.startAt, endAt: w.endAt })) }
          : undefined,
      },
      include: { windows: true },
    });

    // (Optional) notify provider via email/webhook here

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
