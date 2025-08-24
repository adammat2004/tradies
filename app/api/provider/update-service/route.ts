import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      name,
      description,
      durationMin,
      pricingModel,
      hourlyRate,
      calloutFee,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    // Optional: validate inputs here like in POST
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        durationMin,
        pricingModel,
        hourlyRate,
        calloutFee,
      },
    });

    return NextResponse.json({ service: updatedService }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
