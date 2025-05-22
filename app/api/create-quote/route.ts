import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';


export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      customer,
      company,
      notes,
      tables,
      subtotal,
      userId,
    } = data;

    const createdQuote = await prisma.quote.create({
      data: {
        userId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        companyName: company.name,
        companyEmail: company.email,
        companyPhone: company.phone,
        companyAddress: company.address,
        companyCity: company.city,
        companyPostalCode: company.postalCode,
        companyCounty: company.county,
        total: subtotal,
        status: 'draft',

        notes: {
          create: notes.map((note: { description: string }) => ({
            description: note.description,
          })),
        },

        tables: {
          create: tables.map((table: any) => ({
            title: table.title,
            columns: table.columns, // NEW: Save dynamic column headers

            items: {
              create: table.items.map((item: any) => ({
                data: item, // NEW: Store entire row as JSON
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(
      { message: 'Quote created successfully', quote: createdQuote },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { message: 'Failed to create quote', error },
      { status: 500 }
    );
  }
}
