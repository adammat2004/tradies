import { NextResponse } from "next/server";
import { sendEmail } from "@/app/actions/sendEmail";
import crypto from "crypto";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request){
    try {
        const { email, quoteId, template, companyEmail } = await req.json();
        if(!email){
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
        const accessToken = crypto.randomBytes(16).toString("base64url");
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 21);
        await prisma.quote.update({
            where: {
                id: quoteId
            },
            data: {
                accesstoken: accessToken,
                accessTokenExpires: expiry,
                template: template
            }
        })

        await sendEmail({
            from: "Admin <info@tradeez.ie>",
            to: email,
            subject: `Your Quote From ${companyEmail}`,
            html: `<p>Click <a href="${process.env.NEXT_PUBLIC_BASE_URL}/view-quote?token=${accessToken}">here</a> to view your quote.</p>`,
        })
        return NextResponse.json({ success: true, message: "Quote has been sent" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}