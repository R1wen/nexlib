import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { generateDownloadLink } from "@/lib/actions/download";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
  });
  if (!product) notFound();

  const { userId } = await auth();

  // Vérifier si l'utilisateur a déjà acheté ce produit
  const accessRight = userId
    ? await prisma.accessRight.findUnique({
        where: {
          clerkUserId_productId: { clerkUserId: userId, productId: product.id },
        },
      })
    : null;

  const alreadyPurchased = accessRight?.status === "ACTIVE";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Colonne Gauche : Image */}
        <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-2xl border bg-muted shadow-sm">
          <img
            src={product.coverImage}
            alt={product.name}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-4 right-4">
            <Badge className="text-sm px-3 py-1">{product.type}</Badge>
          </div>
        </div>

        {/* Colonne Droite : Infos */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-primary">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: product.currency,
              }).format(product.price / 100)}
            </p>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="pt-4">
            {alreadyPurchased ? (
              <form action={generateDownloadLink.bind(null, product.id)}>
                <Button
                  size="lg"
                  className="w-full md:w-auto px-12 py-6 text-lg rounded-full shadow-lg"
                >
                  Télécharger
                </Button>
              </form>
            ) : (
              <form action={createCheckoutSession.bind(null, product.id)}>
                <Button
                  size="lg"
                  className="w-full md:w-auto px-12 py-6 text-lg rounded-full shadow-lg"
                >
                  Acheter maintenant
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
