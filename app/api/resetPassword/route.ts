import { NextResponse } from "next/server";
import { sendEmail } from "@/app/actions/sendEmail"
import prisma from "@/app/libs/prismadb";
import { ResetPasswordEmailTemplate } from "@/app/components/ResetPasswordEmail";
import crypto from "crypto";

// Handle POST request for password reset
export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Generate token and expiration date
        const resetPasswordToken = crypto.randomBytes(20).toString("base64url");
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 1); // Token valid for 24 hours

        // Update user record with token
        await prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken, resetPasswordExpires: expiry },
        });

        // Send reset email
        await sendEmail({
            from: "Admin <info@tradeez.ie>",
            to: [email],
            subject: "Reset your password",
            react: ResetPasswordEmailTemplate({ email, resetPasswordToken }) as React.ReactElement,
        });

        return NextResponse.json({ success: true, message: "Password reset email sent" }, { status: 200 });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

