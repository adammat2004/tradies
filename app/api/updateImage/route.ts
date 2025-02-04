import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
    try {
        const { id, imageSrc } = await req.json();

        if (!id || !imageSrc) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const updatedListing = await prisma.listing.update({
            where: { id },
            data: { imageSrc },
        });

        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error("Error updating image:", error);
        return NextResponse.json(
            { error: "Failed to update image" },
            { status: 500 }
        );
    }
}
