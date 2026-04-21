import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/app/dashboard/seller/_components/ProductForm";

interface PageProps {
    params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const { productId } = await params;

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        notFound();
    }

    if (product.sellerId !== userId) {
        redirect("/dashboard/seller");
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Modifier le Produit</h1>
                <p className="text-muted-foreground">
                    Mettez à jour les informations de votre produit.
                </p>
            </div>

            <ProductForm product={product} />
        </div>
    );
}
