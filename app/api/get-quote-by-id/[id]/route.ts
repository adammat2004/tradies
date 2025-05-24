// app/api/quotes/[id]/route.ts
import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  
    try {
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
