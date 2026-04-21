import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { generateDownloadLink } from "@/lib/actions/download";
import { Download } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const userAccess = await prisma.accessRight.findMany({
    where: {
      clerkUserId: userId,
      status: "ACTIVE",
    },
    include: {
      product: true,
    },
    orderBy: {
      purchaseDate: "desc",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mes Achats</h1>
        <p className="text-muted-foreground">
          Retrouvez ici tous vos ebooks et formations.
        </p>
      </div>
      <div className="mb-6">
        <a href="/dashboard/seller">
          <Button variant="outline">Dashboard vendeur</Button>
        </a>
      </div>

      {userAccess.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-20 text-center">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Vous n&apos;avez pas encore d&apos;achats
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Explorez notre catalogue pour commencer votre apprentissage.
          </p>
          <Button asChild>
            <Link href="/products">Voir le catalogue</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAccess.map(({ product, downloadCount, purchaseDate }) => (
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
                  <span className="text-xs text-muted-foreground">
                    {downloadCount} téléchargement{downloadCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <CardTitle className="text-xl line-clamp-1">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Acheté le{" "}
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
                    new Date(purchaseDate)
                  )}
                </p>
              </CardContent>
              <CardFooter>
                <form
                  action={generateDownloadLink.bind(null, product.id)}
                  className="w-full"
                >
                  <Button type="submit" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Télécharger
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
