import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const quoteId = url.searchParams.get("id");

    if (!quoteId) {
      return NextResponse.json({ error: "Missing quote ID" }, { status: 400 });
    }

    // Delete the job listing using the provided ID
    const deletedQuote = await prisma.quote.delete({
      where: {
        id: quoteId,
      },
    });

    if (!deletedQuote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Quote deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}