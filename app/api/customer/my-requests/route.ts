import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"

import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(req: Request){
    try{
        const currentUser = await getCurrentUser();
        if(!currentUser){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
    
        const url = new URL(req.url)
        const userId = url.searchParams.get("userId");
        if(!userId || userId !== currentUser.id){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
    
        const requests = await prisma.request.findMany({
            where: {
                customerId: userId,
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                customer: {
                    select: {
                        name: true,
                    }
                },
                windows: true,
                service: true,
                listing: true
            }
        })
        return NextResponse.json(requests);
    } catch(error){
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}