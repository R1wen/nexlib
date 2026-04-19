import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { sendPurchaseConfirmation } from "@/lib/email";
import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const productId = session.metadata?.productId;
    const clerkUserId = session.metadata?.clerkUserId;
    const amountPaid = session.amount_total ?? 0;
    const stripeCheckoutSessionId = session.id;
    const stripePaymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;

    if (!productId || !clerkUserId) {
      console.error("Metadata manquante dans la session Stripe");
      return NextResponse.json({ error: "Metadata manquante" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, price: true },
    });

    if (!product) {
      console.error("Produit introuvable:", productId);
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    // Créer l'historique de commande + l'item
    await prisma.orderHistory.create({
      data: {
        clerkUserId,
        stripeCheckoutSessionId,
        stripePaymentIntentId,
        totalAmount: amountPaid,
        currency: "XOF",
        status: "COMPLETED",
        items: {
          create: [
            {
              productId,
              productName: product.name,
              pricePaid: amountPaid,
              currency: "XOF",
            },
          ],
        },
      },
    });

    // Créer le droit d'accès (idempotent via upsert)
    await prisma.accessRight.upsert({
      where: { clerkUserId_productId: { clerkUserId, productId } },
      create: {
        clerkUserId,
        productId,
        stripeCheckoutSessionId,
        amountPaid,
        currency: "XOF",
        status: "ACTIVE",
        purchaseDate: new Date(),
      },
      update: {
        status: "ACTIVE",
        stripeCheckoutSessionId,
        amountPaid,
        purchaseDate: new Date(),
      },
    });

    // Envoyer l'email de confirmation
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      const email = user.emailAddresses[0]?.emailAddress;

      if (email) {
        await sendPurchaseConfirmation({
          to: email,
          productName: product.name,
          amountPaid,
        });
      }
    } catch (emailError) {
      // L'email est best-effort, on ne bloque pas le webhook
      console.error("Erreur envoi email confirmation:", emailError);
    }
  }

  return NextResponse.json({ received: true });
}
