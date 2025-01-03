import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { stripe } from '@/app/libs/stripe';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false, // Required for webhook
  },
};

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('Webhook signature missing');
    return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text(); // Read raw request body
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Webhook event constructed successfully:', event.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;
      console.log("session2id", session.id);
      // Extract metadata from the session
      const { tempListingId, userId } = session.metadata || {};
      console.log('Metadata extracted:', { tempListingId, userId });

      if (!tempListingId || !sessionId || !userId) {
        throw new Error('Required metadata is missing from the Stripe session.');
      }

      // Retrieve the temporary listing
      const tempListing = await prisma.tempListing.findUnique({
        where: { id: tempListingId },
      });

      if (!tempListing) {
        throw new Error('Temporary listing not found.');
      }

      console.log('Temporary listing retrieved:', tempListing);

      // Determine the plan based on the price ID
      let plan = 'premium'; // Default to 'premium'
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

      for (const item of lineItems.data) {
        const priceId = item.price?.id;
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID) {
          plan = 'yearly';
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID) {
          plan = 'monthly';
        }
      }

      console.log('Plan determined:', plan);

      // Create a new active listing
      const newListing = await prisma.listing.create({
        data: {
          category: tempListing.category,
          imageSrc: tempListing.imageSrc,
          title: tempListing.title,
          description: tempListing.description,
          email: tempListing.email,
          phone_number: tempListing.phone_number,
          company_name: tempListing.company_name,
          street: tempListing.street,
          town: tempListing.town,
          city: tempListing.city,
          county: tempListing.county,
          country: tempListing.country,
          plan: plan, // Use the determined plan
          isActive: true, // Mark the listing as active
          userId: tempListing.userId,
        },
      });

      console.log('New listing created:', newListing);

      // Delete the temporary listing after converting
      await prisma.tempListing.delete({
        where: { id: tempListing.id },
      });

      console.log('Temporary listing deleted successfully.');
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }
    if(event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;
      console.log("subscriptionId", subscriptionId);
      const userId = subscription.metadata.userId;
      console.log("userId", userId);
      const listing = await prisma.listing.findFirst({
        where: { userId: userId }
      });
      if(!listing) {
        throw new Error('Listing not found.');
      }
      console.log("listing", listing);
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          isActive: false,
          plan: 'free'
        }
      });
      console.log("listing updated");
    } else {
      console.log(`Unhandled event type: ${event.type}`);}

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error handling event:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



{/*export async function OPTIONS() {
  return NextResponse.json({ message: 'OK' }, { status: 200 });
}*/}
