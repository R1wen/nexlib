import { z } from "zod";

export const ProductSchema = z.object({
    id: z.string().uuid(),
    slug: z.string().min(1, "Le slug est requis").regex(/^[a-z0-9-]+$/, "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"),
    name: z.string().min(1, "Le nom est requis").max(200),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
    price: z.number().int().positive("Le prix doit être positif"),
    currency: z.literal("XOF"),
    type: z.enum(["ebook", "formation"]),
    coverImage: z.string().url("L'URL de l'image doit être valide"),
    fileStorageKey: z.string().min(1, "La clé de stockage du fichier est requise"),
    fileSize: z.number().int().positive().optional(),
    fileMimeType: z.string().optional(),
    isPublished: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductTypeLabels: Record<Product["type"], string> = {
    ebook: "Ebook",
    formation: "Formation",
};
