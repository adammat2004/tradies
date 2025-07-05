// app/api/quotes/[id]/route.ts
import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    console.log('Fetching invoice with ID:', params.id);
    try {
    const invoice = await prisma.invoice.findUnique({
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
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
