"use server";

import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

const UploadRequestSchema = z.object({
  fileName: z.string().min(1, "Le nom du fichier est requis"),
  fileType: z.string().min(1, "Le type MIME est requis"),
  fileSize: z.number().max(1024 * 1024 * 1024),
  destination: z.enum(["products", "covers"]),
});

type UploadRequest = z.infer<typeof UploadRequestSchema>;

export async function getPresignedUploadUrl(values: UploadRequest) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: Vous devez être connecté pour uploader des fichiers.");
  }

  const result = UploadRequestSchema.safeParse(values);

  if (!result.success) {
    throw new Error("Invalid upload data: " + JSON.stringify(result.error.flatten()));
  }

  const { fileName, fileType, fileSize, destination } = result.data;

  if (destination === "covers") {
    if (fileSize > 1024 * 1024 * 5) {
      throw new Error("L'image de couverture ne doit pas dépasser 5MB.");
    }
    if (!fileType.startsWith("image/")) {
      throw new Error("Le fichier de couverture doit être une image.");
    }
  }

  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "-");
  const fileKey = `${destination}/${userId}/${Date.now()}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    // Génère l'URL avec l'endpoint privé R2
    const privateUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    // Remplace l'hostname privé par le domaine public r2.dev si configuré
    const publicBase = process.env.R2_PUBLIC_URL;
    const signedUrl = publicBase
      ? privateUrl.replace(
          `https://${R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          publicBase
        )
      : privateUrl;

    return {
      success: true,
      signedUrl,
      fileKey,
    };
  } catch (error) {
    console.error("Erreur génération URL R2:", error);
    throw new Error("Impossible de préparer l'upload. Veuillez réessayer.");
  }
}
