import type { Metadata } from "next";
import { CardProduct } from "@/components/products/CardProduct";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Nos Produits",
  description: "Découvrez notre sélection d'ebooks et de formations",
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Nos Produits</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez notre sélection d&apos;ebooks et de formations pour développer
          vos compétences
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <CardProduct key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
