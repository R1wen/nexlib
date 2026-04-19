"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function generateDownloadLink(productId: string) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Vérifier le droit d'accès
  const accessRight = await prisma.accessRight.findUnique({
    where: { clerkUserId_productId: { clerkUserId: userId, productId } },
    include: { product: true },
  });

  if (!accessRight || accessRight.status !== "ACTIVE") {
    redirect("/dashboard");
  }

  const { product } = accessRight;

  // Générer un token unique
  const token = randomBytes(32).toString("hex");

  // Enregistrer le token en DB (expire dans 5 minutes)
  await prisma.downloadLink.create({
    data: {
      clerkUserId: userId,
      productId,
      token,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Générer l'URL presignée R2 directement (expire dans 5 minutes)
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: product.fileStorageKey,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(product.name)}"`,
  });

  const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

  // Mettre à jour les statistiques de téléchargement
  await prisma.accessRight.update({
    where: { clerkUserId_productId: { clerkUserId: userId, productId } },
    data: {
      downloadCount: { increment: 1 },
      lastDownloadedAt: new Date(),
    },
  });

  // Marquer le token comme utilisé immédiatement
  await prisma.downloadLink.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  redirect(presignedUrl);
}
