import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(req: Request){
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const url = new URL(req.url);
        const requestId = url.searchParams.get("requestId");
        const request = await prisma.request.findUnique({
            where: {
                id: requestId as string,
            },
        });
        if(!request){
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }
        

        await prisma.request.update({
            where: {
                id: requestId as string,
            },
            data: {
                status: "accepted",
            },
        });
        return NextResponse.json({ message: "Request accepted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}