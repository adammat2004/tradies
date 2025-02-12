import {NextResponse} from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
    try {
        const {id, description} = await req.json();
        if (!id || !description) {
            return NextResponse.json(
                {error: "Missing required fields"},
                {status: 400}
            );
        }
        const updatedListing = await prisma.listing.update({
            where: {id: id},
            data: {
                description: description
            },
        });
        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error("Error updating description:", error);
        return NextResponse.json(
            {error: "Failed to update description"},
            {status: 500}
        );
    }
}