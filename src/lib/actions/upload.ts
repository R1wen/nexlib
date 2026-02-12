"use server";

import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { r2, R2_BUCKET_NAME } from "@/src/lib/r2";

// Schéma de validation de la demande d'upload
const UploadRequestSchema = z.object({
  fileName: z.string().min(1, "Le nom du fichier est requis"),
  fileType: z.string().min(1, "Le type MIME est requis"), // ex: application/pdf
  fileSize: z.number().max(1024 * 1024 * 1024), // Limite globale de sécurité (1GB)
  destination: z.enum(["products", "covers"]), // Dossier de destination
});

type UploadRequest = z.infer<typeof UploadRequestSchema>;

/**
 * Génère une URL pré-signée (Presigned URL) pour uploader un fichier directement vers Cloudflare R2.
 * Cette action est sécurisée et ne permet l'upload qu'aux utilisateurs connectés.
 */
export async function getPresignedUploadUrl(values: UploadRequest) {
  // 1. Sécurité : Vérifier l'authentification
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: Vous devez être connecté pour uploader des fichiers.");
  }

  // 2. Validation des données entrantes
  const result = UploadRequestSchema.safeParse(values);

  if (!result.success) {
    throw new Error("Invalid upload data: " + JSON.stringify(result.error.flatten()));
  }

  const { fileName, fileType, fileSize, destination } = result.data;

  // Validation spécifique selon la destination (optionnel mais recommandé)
  if (destination === "covers") {
    // Max 5MB pour les images
    if (fileSize > 1024 * 1024 * 5) {
      throw new Error("L'image de couverture ne doit pas dépasser 5MB.");
    }
    if (!fileType.startsWith("image/")) {
      throw new Error("Le fichier de couverture doit être une image.");
    }
  }

  // 3. Génération de la clé de fichier (Chemin unique dans le bucket)
  // Structure : destination/USER_ID/TIMESTAMP-nom_nettoyé
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "-");
  const fileKey = `${destination}/${userId}/${Date.now()}-${sanitizedFileName}`;

  // 4. Préparation de la commande S3
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSize,
    // Metadonnées personnalisées utiles pour le suivi
    Metadata: {
      userId: userId,
      originalName: fileName,
    },
  });

  try {
    // 5. Génération de l'URL signée (Valide 5 minutes)
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return {
      success: true,
      signedUrl,
      fileKey, // C'est cette clé qu'on enregistrera dans la base de données Prisma
    };
  } catch (error) {
    console.error("Erreur génération URL R2:", error);
    throw new Error("Impossible de préparer l'upload. Veuillez réessayer.");
  }
}