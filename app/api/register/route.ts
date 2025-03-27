import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { sendEmail } from "@/app/actions/sendEmail";
import { VerifyEmailTemplate } from "@/app/components/verify-email-template";

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

        const emailVerificationToken = crypto.randomBytes(32).toString("base64url");
        const today = new Date();

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                emailVerificationToken: emailVerificationToken,
            }
        })

        await sendEmail({
            from: "Admin <info@tradeez.ie>",
            to: [email],
            subject: "Verify your email",
            react: VerifyEmailTemplate({ email, verifyEmailToken: emailVerificationToken }),
        })

        return NextResponse.json({ success: true, email, password });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

