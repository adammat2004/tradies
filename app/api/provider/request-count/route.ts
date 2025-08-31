import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(req: Request){
    try{
        const currentUser = await getCurrentUser();
        if(!currentUser || currentUser.mode !== "work"){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const url = new URL(req.url)
        const listingId = url.searchParams.get("listingId") || undefined;
    
        const requests = await prisma.request.findMany({
            where: {
                listingId
            },
        })
        return NextResponse.json(requests.length);
    } catch(error){
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}