import { stripe } from "@/app/libs/stripe";
import exp from "constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { connected_account_id } = await req.json();
    
        if (!connected_account_id) {
        return NextResponse.json({ error: 'Connected account ID is required' }, { status: 400 });
        }
    
        const loginLink = await stripe.accounts.createLoginLink(connected_account_id);
    
        return NextResponse.json({ url: loginLink.url });
    } catch (error) {
        console.error('Error creating Stripe login link:', error);
        return NextResponse.json(
        { error: 'An error occurred while creating the Stripe login link.' },
        { status: 500 }
        );
    }
}