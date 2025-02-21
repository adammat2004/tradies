import bcrypt from "bcryptjs";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password } = body;

        if (!email || !name || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = await prisma.user.create({
            data: { email, name, hashedPassword },
        });

        return NextResponse.json({ success: true, email, password });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

