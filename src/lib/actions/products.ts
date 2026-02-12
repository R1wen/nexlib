"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/src/lib/prisma";
import { ProductSchema } from "@/src/lib/schemas/product.schema";

const CreateProductSchema = ProductSchema.pick({
  name: true,
  description: true,
  price: true,
  type: true,
  coverImage: true,
  fileStorageKey: true,
  fileSize: true,      // Optionnel
  fileMimeType: true,  // Optionnel
});

const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;


export async function createProduct(data: CreateProductInput) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Non autorisé : Vous devez être connecté." };
  }

  // Validation des données entrantes (Server-Side Validation)
  const result = CreateProductSchema.safeParse(data);
  if (!result.success) {
    return { 
      error: "Données invalides", 
      fieldErrors: result.error.flatten().fieldErrors 
    };
  }

  const { name, description, price, type, coverImage, fileStorageKey, fileSize, fileMimeType } = result.data;

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    + "-" + Date.now().toString().slice(-4);

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        price,
        type,
        coverImage,
        fileStorageKey: fileStorageKey || "pending-upload",
        fileSize: fileSize ?? 0,
        fileMimeType: fileMimeType ?? "application/octet-stream",
        slug,
        sellerId: userId,
        isPublished: false, // Brouillon par défaut
      },
    });
  } catch (error) {
    console.error("Erreur CreateProduct:", error);
    return { error: "Impossible de créer le produit. Veuillez réessayer." };
  }

  revalidatePath("/dashboard/seller");
  redirect("/dashboard/seller");
}


export async function updateProduct(id: string, data: UpdateProductInput) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Non autorisé" };
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { sellerId: true },
  });

  if (!existingProduct || existingProduct.sellerId !== userId) {
    return { error: "Non autorisé ou produit introuvable." };
  }

  const result = UpdateProductSchema.safeParse(data);
  if (!result.success) {
    return { 
      error: "Données invalides", 
      fieldErrors: result.error.flatten().fieldErrors 
    };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...result.data,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Erreur UpdateProduct:", error);
    return { error: "Erreur lors de la mise à jour." };
  }

  revalidatePath("/dashboard/seller");
  revalidatePath(`/dashboard/seller/${id}`);
  redirect("/dashboard/seller");
}


export async function deleteProduct(id: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Non autorisé" };
  }

  // Vérification propriété
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { sellerId: true },
  });

  if (!existingProduct || existingProduct.sellerId !== userId) {
    return { error: "Interdit de supprimer ce produit." };
  }

  try {
    await prisma.product.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Erreur DeleteProduct:", error);
    return { error: "Erreur lors de la suppression." };
  }

  revalidatePath("/dashboard/seller");
  return { success: true };
}