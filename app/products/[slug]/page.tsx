import { notFound } from "next/navigation";
import prisma from "@/src/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/button";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: {
      slug: slug,
      isPublished: true,
    },
  });
  if (!product) notFound();

  {
    /*Petit test pour recuperer les infos User*/
  }
  const { userId } = await auth();
  const user = await currentUser();

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
            {/* Note: product.type est maintenant un Enum Prisma (EBOOK / FORMATION) */}
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
            <Button
              size="lg"
              className="w-full md:w-auto px-12 py-6 text-lg rounded-full shadow-lg"
            >
              Acheter maintenant
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Clerk */}
      {userId && (
        <div className="mt-20 p-6 rounded-xl border border-dashed bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="text-sm font-medium mb-3 text-zinc-500 uppercase tracking-wider">
            Debug Connexion
          </h3>
          <p className="text-sm">
            Connecté en tant que : {user?.emailAddresses[0].emailAddress} (ID:{" "}
            {userId})
          </p>
        </div>
      )}
    </div>
  );
}
