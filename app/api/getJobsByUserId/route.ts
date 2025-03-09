import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request, res: Response) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const jobListings = await prisma.job.findMany({
            where: {
                userId: userId,
            },
        });

        return NextResponse.json({ data: jobListings });
    } catch (error) {
        console.error("Error fetching job listings:", error);
        return NextResponse.json({ error: "Failed to fetch job listings" }, { status: 500 });
    }
}
