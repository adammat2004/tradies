import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { listingId: string}}){

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: params.listingId },
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        const embeddingInput = listing.embeddingParts;
        if (!embeddingInput) {
            return NextResponse.json({ error: 'Embedding input not found' }, { status: 404 });
        }

        return NextResponse.json({data: embeddingInput});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}