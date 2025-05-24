import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: NextRequest){
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
        const quote = await prisma.quote.findFirst({
            where: {
                accesstoken: token,
            },
            include: {
                tables: {
                include: {
                    items: true,
                },
                },
                notes: true,
            },
        });
        
        if (!quote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }
        return NextResponse.json(quote, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}