import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { stripe } from '@/app/libs/stripe';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      category,
      imageSrc,
      title,
      description,
      email,
      phone_number,
      company_name,
      operationCounties,
      street,
      town,
      city,
      county,
      country,
      plan,
      is_business
    } = await req.json();
    // Validate required fields
    if (!category || !email || !operationCounties || !title || !description || !phone_number || !company_name || !street || !town || !city || !county || !country ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Create the temporary listing
    const tempListing = await prisma.tempListing.create({
      data: {
        category,
        imageSrc,
        title,
        description,
        email,
        phone_number,
        company_name,
        street,
        town,
        city,
        county,
        is_business,
        operationCounties,
        country,
        plan: 'premium',
        isActive: false,
        userId: currentUser.id,
      },
    });

    const { id: tempListingId, email: userEmail, userId } = tempListing;

    if (!tempListing) {
      return NextResponse.json({ error: 'Failed to create temp listing' }, { status: 500 });
    }
    // Create Stripe session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: is_business === false
            ? process.env.NEXT_PUBLIC_STRIPE_INDIVIDUAL_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        email: userEmail,
        userId: userId.toString(),
        tempListingId: tempListingId.toString(),
      },
    });
    // Update the tempListing with the Stripe session ID
    await prisma.tempListing.update({
      where: { id: tempListingId },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ sessionUrl: session.url }, { status: 200 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create temp listing' }, { status: 500 });
  }
}


{/*export async function OPTIONS() {
  return NextResponse.json({ message: 'OK' }, { status: 200 });
}*/}
