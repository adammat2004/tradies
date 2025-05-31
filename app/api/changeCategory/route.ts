import {NextResponse} from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function POST(req: Request) {
    try {
        const {id, categories} = await req.json();
        if (!id || !categories) {
            return NextResponse.json(
                {error: "Missing required fields"},
                {status: 400}
            );
        }
        const updatedListing = await prisma.listing.update({
            where: {id: id},
            data: {
                category: categories
            }
        });
        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error("Error updating categories:", error);
        return NextResponse.json(
            {error: "Failed to update categories"},
            {status: 500}
        );
    }
}