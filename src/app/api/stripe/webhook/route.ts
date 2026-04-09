import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const body = await request.text();

  if (!stripe || !env.stripeWebhookSecret || !signature) {
    return NextResponse.json({ ok: false, message: "Stripe no configurado." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Firma invalida." },
      { status: 400 },
    );
  }

  const existing = await prisma.stripeEventLog.findUnique({
    where: { eventId: event.id },
  });

  if (existing) {
    return NextResponse.json({ ok: true, deduplicated: true });
  }

  await prisma.stripeEventLog.create({
    data: {
      eventId: event.id,
      eventType: event.type,
      payload: event as unknown as object,
    },
  });

  return NextResponse.json({ ok: true, received: event.type });
}
