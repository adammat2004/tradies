import { stripe } from "../../libs/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { account } = await req.json();

    const origin = req.headers.get("origin") || "http://localhost:3000"; // fallback if origin is missing

    const accountLink = await stripe.accountLinks.create({
      account: account,
      refresh_url: `${origin}/refresh/${account}`,
      return_url: `${origin}/return/${account}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account link:",
      error
    );

    return NextResponse.json(
      { error: "An error occurred while creating the Stripe account link." },
      { status: 500 }
    );
  }
}
