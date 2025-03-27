import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { resetPasswordToken, password } = await req.json();

        const user = await prisma.user.findFirst({
            where: { resetPasswordToken }
        });

        if (!user) {
            return NextResponse.json({ message: "No user found" }, { status: 404 });
        }

        const resetPasswordTokenExpiry = user.resetPasswordExpires;
        if (!resetPasswordTokenExpiry || new Date() > resetPasswordTokenExpiry) {
            return NextResponse.json({ message: "Token expired" }, { status: 400 });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                hashedPassword: passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error updating password:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
