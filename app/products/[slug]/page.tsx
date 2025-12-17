import { mockProducts } from "@/src/lib/mock-data";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

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
  const { userId } = await auth();
  const user = await currentUser();
  console.log("======== DEBUT DES INFOS ========")
  console.log(user)

  return (
    <div>
      {product.name}
      <ol>
        <li>{userId}</li>
        <li>{user?.firstName} {user?.lastName}</li>
        <li>{user?.emailAddresses[0].emailAddress}</li>
      </ol>
    </div>
  );
}
