"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(productId: string) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId, isPublished: true },
  });

  if (!product) {
    redirect("/products");
  }

  // Vérifier si l'utilisateur a déjà acheté ce produit
  const existing = await prisma.accessRight.findUnique({
    where: { clerkUserId_productId: { clerkUserId: userId, productId } },
  });

  if (existing) {
    redirect("/dashboard");
  }

  // XOF est une devise zéro-décimal dans Stripe : on envoie le montant en unité entière
  // La DB stocke le prix * 100, donc on divise par 100 pour Stripe
  const stripeAmount = Math.round(product.price / 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "xof",
          unit_amount: stripeAmount,
          product_data: {
            name: product.name,
            description: product.description.slice(0, 255),
            images: [],
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      productId: product.id,
      clerkUserId: userId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
  });

  if (!session.url) {
    redirect(`/products/${product.slug}`);
  }

  redirect(session.url);
}
