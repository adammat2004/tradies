import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(req: Request){
    try{
        const currentUser = await getCurrentUser();
        if(!currentUser || currentUser.mode !== "work"){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const providerId = currentUser.id as string | undefined;
        if(!providerId){    
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const listing = await prisma.listing.findFirst({
            where: {
                userId: providerId,
            },
            select: {
                id: true,
            }
        });
        return NextResponse.json({listingId: listing?.id || null});
    } catch(error){
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}