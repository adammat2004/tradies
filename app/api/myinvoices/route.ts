import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(){
    try {
        const currentUser = await getCurrentUser();
    
        if(!currentUser){
            return NextResponse.json({message: "No user found"}, {status: 401});
        }
    
        const quotes = await prisma.invoice.findMany({
            where: {
                userId: currentUser.id
            }
        })
        return NextResponse.json(quotes, {status: 200});
    } catch(error){
        return NextResponse.json({message: "Internal server error"}, {status: 500});
    }
}