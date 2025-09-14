import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request){
    const currentUser = await getCurrentUser();
    
    if(!currentUser){
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const listingId = currentUser.id;
    const listings = await prisma.listing.findMany({
        where: {
            userId: listingId
        },
    })
    {/*if(listings.length === 0){
        return NextResponse.json({error: 'No listings found'}, {status: 404});
    }*/}
    return NextResponse.json({data: currentUser}, {status: 200});
}