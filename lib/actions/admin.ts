"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

async function assertAdmin() {
    const { userId, sessionClaims } = await auth();
    if (!userId) return { error: "Non autorisé" as const };
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") return { error: "Accès refusé" as const };
    return { userId };
}

export async function adminTogglePublish(id: string, currentState: boolean) {
    const check = await assertAdmin();
    if ("error" in check) return check;

    try {
        await prisma.product.update({
            where: { id },
            data: { isPublished: !currentState },
        });
    } catch {
        return { error: "Erreur lors du changement de statut." };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
}

export async function adminDeleteProduct(id: string) {
    const check = await assertAdmin();
    if ("error" in check) return check;

    const product = await prisma.product.findUnique({
        where: { id },
        select: { fileStorageKey: true, coverImage: true },
    });

    if (!product) return { error: "Produit introuvable." };

    try {
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: product.fileStorageKey }));
        const coverKey = new URL(product.coverImage).pathname.slice(1);
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: coverKey }));
    } catch {
        // best-effort
    }

    try {
        await prisma.product.delete({ where: { id } });
    } catch {
        return { error: "Erreur lors de la suppression." };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
}
