import { stripe } from "../../libs/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'sepa_debit'],
        line_items: [
            {
            price_data: {
                currency: 'eur',
                product_data: {
                name: 'T-shirt',
                },
                unit_amount: 1000,
            },
            quantity: 1,
            },
        ],
        payment_intent_data: {
            application_fee_amount: 0,
            transfer_data: {
            destination: 'acct_1RZuJJ4MSw1kvwBL',
            },
        },
        mode: 'payment',
        success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
        metadata:{
            connected_account_id: 'acct_1RZuJJ4MSw1kvwBL',
        }
        });
        return NextResponse.json({ url: session.url });
    } catch (error) {
        return NextResponse.json(
            { error: "An error occurred while creating the checkout session." }, {status: 500}
        )
    }
}