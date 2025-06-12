import {stripe} from '../../libs/stripe';
import { NextResponse, NextRequest} from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  if (req.method === 'POST') {
    try {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: {
            type: "express",
          },
          fees: {
            payer: "application"
          },
          losses: {
            payments: "application"
          },
        },
      });
      console.log('Stripe account created:', account.id);
       return NextResponse.json({account: account.id});
    } catch (error) {
      console.error('An error occurred when calling the Stripe API to create an account:', error);
      return NextResponse.json({error: 'An error occurred while creating the Stripe account.'}, {status: 500});
    }
  }
}