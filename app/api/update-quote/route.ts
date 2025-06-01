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
      id
    } = data;

    // Step 1: Delete old nested records
    await prisma.note.deleteMany({
      where: { quoteId: id },
    });

    const oldTables = await prisma.table.findMany({
      where: { quoteId: id },
      select: { id: true },
    });

    const oldTableIds = oldTables.map(t => t.id);

    await prisma.item.deleteMany({
      where: {
        tableId: { in: oldTableIds },
      },
    });

    await prisma.table.deleteMany({
      where: { quoteId: id },
    });

    // Step 2: Update main quote + re-create nested records
    const updatedQuote = await prisma.quote.update({
      where: { id },
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
            columns: table.columns,
            multiplierColumns: table.multiplierColumns,
            items: {
              create: table.items.map((item: any) => ({
                data: item,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(
      { message: 'Quote updated successfully', quote: updatedQuote },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { message: 'Failed to update quote', error },
      { status: 500 }
    );
  }
}
