import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function DELETE(req: Request){
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const service = await prisma.service.delete({
            where: { id },
        });

        return NextResponse.json(service, { status: 200 });
    } catch (error) {
        console.error("Delete service error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}