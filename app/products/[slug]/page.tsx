import { mockProducts } from "@/src/lib/mock-data";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  {
    /*Petit test pour recuperer les infos User*/
  }
  // const { userId } = auth();
  // if (!userId) {
  //   throw new Error("Utilisateur non connecté");
  // }

  return (
    <div>
      {product.name}
    </div>
  );
}
