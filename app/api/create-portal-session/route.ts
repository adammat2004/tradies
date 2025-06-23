// /app/api/create-portal-session/route.ts
import { stripe } from '@/app/libs/stripe';
import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(req: Request) {
  const body = await req.json();
  const { listingId } = body;  
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the Stripe customer ID from your database
  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
    },
  });

  if (!listing || !listing.stripeCustomerId) {
    return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: listing.stripeCustomerId,
    return_url: process.env.NEXT_PUBLIC_BASE_URL, // or wherever you want to redirect back to
  });

  return NextResponse.json({ url: portalSession.url });
}
