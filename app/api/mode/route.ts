import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode } = body;

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (mode !== 'basic' && mode !== 'work') {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mode },
    });

    return NextResponse.json({ message: "Mode updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating mode:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}