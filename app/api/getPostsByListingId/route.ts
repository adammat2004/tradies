import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request, res: Response) {
    try {
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get("listingId");

        if (!listingId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const posts = await prisma.posts.findMany({
            where: {
                listingId: listingId,
            },
        });

        return NextResponse.json({ data: posts });
    } catch (error) {
        console.error("Error fetching job listings:", error);
        return NextResponse.json({ error: "Failed to fetch job listings" }, { status: 500 });
    }
}