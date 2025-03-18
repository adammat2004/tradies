import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, listingId, comment, imageSrc } = body;
        // Validate required fields
        if (!userId || !listingId) {
            return NextResponse.json({ error: 'User ID and Listing ID are required' }, { status: 400 });
        }

        // Ensure imageSrc is always an array
        const imageArray = Array.isArray(imageSrc) ? imageSrc : [];

        // Create the post in the database
        const newPost = await prisma.posts.create({
            data: {
                userId,
                listingId,
                comment,
                pictures: imageArray, // Store multiple images
            },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


