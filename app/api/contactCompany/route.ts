import { sendEmail } from "@/app/actions/sendEmail";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    try {
        const { 
            firstName,
            lastName,
            email,
            phone,
            projectDescription,
            addressLine1,
            addressLine2,
            town,
            county,
            eircode,
            companyEmail,
            companyPhone 
        } = await request.json();

        await sendEmail({
            from: `Admin <info@tradeez.ie>`,
            to: [companyEmail],
            subject: `New Contact Form Submission from ${firstName} ${lastName}`,
            html: `
                <h1>Contact Form Submission</h1>
                <p><strong>First Name:</strong> ${firstName}</p>
                <p><strong>Last Name:</strong> ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Project Description:</strong> ${projectDescription}</p>
                <p><strong>Address Line 1:</strong> ${addressLine1}</p>
                <p><strong>Address Line 2:</strong> ${addressLine2}</p>
                <p><strong>Town:</strong> ${town}</p>
                <p><strong>County:</strong> ${county}</p>
                <p><strong>Eircode:</strong> ${eircode}</p>
            `
        })
        return NextResponse.json({ success: true, message: "Email sent successfully!"});
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to send email." });
    }
}