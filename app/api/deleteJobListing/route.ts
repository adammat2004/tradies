import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const jobListingId = url.searchParams.get("id");

    if (!jobListingId) {
      return NextResponse.json({ error: "Missing job listing ID" }, { status: 400 });
    }

    // Delete the job listing using the provided ID
    const deletedJobListing = await prisma.job.delete({
      where: {
        id: jobListingId,
      },
    });

    if (!deletedJobListing) {
      return NextResponse.json({ error: "Job listing not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job listing deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting job listing:", error);
    return NextResponse.json({ error: "Failed to delete job listing" }, { status: 500 });
  }
}
