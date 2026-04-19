import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const destination = formData.get("destination") as string | null;

  if (!file || !destination) {
    return NextResponse.json({ error: "Fichier ou destination manquant" }, { status: 400 });
  }

  if (!["products", "covers"].includes(destination)) {
    return NextResponse.json({ error: "Destination invalide" }, { status: 400 });
  }

  if (destination === "covers") {
    if (file.size > 1024 * 1024 * 5) {
      return NextResponse.json({ error: "Image trop grande (max 5MB)" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 });
    }
  }

  if (file.size > 1024 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop grand (max 1GB)" }, { status: 400 });
  }

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const fileKey = `${destination}/${userId}/${Date.now()}-${sanitizedFileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ContentLength: buffer.length,
    })
  );

  return NextResponse.json({ success: true, fileKey });
}
