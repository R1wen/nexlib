import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Récupération des produits achetés via la table AccessRight
  const userAccess = await prisma.accessRight.findMany({
    where: {
      clerkUserId: userId,
    },
    include: {
      product: true,
    },
  });

  const myProducts = userAccess.map((access) => access.product);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mes Achats</h1>
        <p className="text-muted-foreground">
          Retrouvez ici tous vos ebooks et formations.
        </p>
      </div>

      {myProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-20 text-center">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Vous n'avez pas encore d'achats
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Explorez notre catalogue pour commencer votre apprentissage.
          </p>
          <Button asChild>
            <Link href="/">Voir le catalogue</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={product.coverImage}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="default">{product.type}</Badge>
                </div>
                <CardTitle className="text-xl line-clamp-1">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/product/${product.slug}`}>
                    Accéder au contenu
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}