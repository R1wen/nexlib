"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, updateProduct } from "@/lib/actions/products";

interface ProductFormProps {
  product?: Product;
}

type FieldErrors = Partial<Record<string, string>>;

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedProductFile, setSelectedProductFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

  function validateFields(formData: FormData): FieldErrors {
    const errors: FieldErrors = {};

    const name = (formData.get("name") as string)?.trim();
    if (!name) errors.name = "Le nom du produit est requis.";
    else if (name.length > 200) errors.name = "Le nom ne doit pas dépasser 200 caractères.";

    const description = (formData.get("description") as string)?.trim();
    if (!description) errors.description = "La description est requise.";
    else if (description.length < 10) errors.description = "La description doit contenir au moins 10 caractères.";

    const price = Number(formData.get("price"));
    if (!price || isNaN(price)) errors.price = "Le prix est requis.";
    else if (price < 100) errors.price = "Le prix minimum est 100 XOF.";
    else if (!Number.isInteger(price)) errors.price = "Le prix doit être un nombre entier.";

    const type = formData.get("type") as string;
    if (!type || !["ebook", "formation"].includes(type)) errors.type = "Veuillez sélectionner un type de produit.";

    if (!product?.coverImage && !selectedCoverFile) errors.coverImage = "L'image de couverture est requise.";
    if (!product?.fileStorageKey && !selectedProductFile) errors.productFile = "Le fichier numérique du produit est requis.";

    return errors;
  }

  async function uploadToR2(file: File, destination: "products" | "covers"): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("destination", destination);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Échec de l'upload vers ${destination}`);
    }
    const { fileKey } = await res.json();
    return fileKey;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // ÉTAPE 0 : VALIDATION CLIENT — avant tout upload
    const errors = validateFields(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    let finalFileKey = product?.fileStorageKey || "";
    let finalCoverKey = product?.coverImage || "";

    // ÉTAPE 1 : UPLOADS R2
    if (selectedProductFile || selectedCoverFile) {
      setUploading(true);
      try {
        const uploadPromises: Promise<void>[] = [];

        if (selectedProductFile) {
          uploadPromises.push(
            uploadToR2(selectedProductFile, "products").then((key) => { finalFileKey = key; })
          );
        }
        if (selectedCoverFile) {
          uploadPromises.push(
            uploadToR2(selectedCoverFile, "covers").then((key) => { finalCoverKey = key; })
          );
        }

        await Promise.all(uploadPromises);
      } catch (e: any) {
        console.error(e);
        setFieldErrors({ _global: e.message || "Erreur lors de l'upload des fichiers." });
        setLoading(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // ÉTAPE 2 : PAYLOAD
    const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    const toPublicUrl = (key: string) =>
      key.startsWith("http") ? key : `${R2_PUBLIC_URL}/${key}`;

    const payload = {
      name: (formData.get("name") as string).trim(),
      description: (formData.get("description") as string).trim(),
      price: Number(formData.get("price")),
      type: formData.get("type") as "ebook" | "formation",
      isPublished: formData.get("isPublished") === "on",
      coverImage: toPublicUrl(finalCoverKey),
      fileStorageKey: finalFileKey,
      fileSize: selectedProductFile?.size,
      fileMimeType: selectedProductFile?.type,
    };

    // ÉTAPE 3 : SAUVEGARDE DB — hors try/catch pour laisser Next.js gérer NEXT_REDIRECT
    const result = product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload as any);

    if (result?.error) {
      setFieldErrors({ _global: result.error });
      setLoading(false);
    }
  }

  const fe = fieldErrors;

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-2xl mx-auto py-6">

      {/* --- ERREUR GLOBALE --- */}
      {fe._global && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-sm">
          {fe._global}
        </div>
      )}

      {/* --- INFORMATIONS GÉNÉRALES --- */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du produit</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name}
            placeholder="Ex: Guide complet Next.js 15"
            className={fe.name ? "border-red-400" : ""}
          />
          {fe.name && <p className="text-xs text-red-500">{fe.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            placeholder="Décrivez ce que contient votre produit... (10 caractères minimum)"
            rows={5}
            className={fe.description ? "border-red-400" : ""}
          />
          {fe.description && <p className="text-xs text-red-500">{fe.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (XOF)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              defaultValue={product?.price}
              min={100}
              placeholder="5000"
              className={fe.price ? "border-red-400" : ""}
            />
            {fe.price && <p className="text-xs text-red-500">{fe.price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de produit</Label>
            <Select name="type" defaultValue={product?.type || "ebook"}>
              <SelectTrigger className={fe.type ? "border-red-400" : ""}>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ebook">Ebook (PDF, EPUB)</SelectItem>
                <SelectItem value="formation">Formation Vidéo</SelectItem>
              </SelectContent>
            </Select>
            {fe.type && <p className="text-xs text-red-500">{fe.type}</p>}
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* --- SECTION FICHIERS (Cloudflare R2) --- */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Fichiers numériques</h3>

        {/* 1. Image de Couverture */}
        <div className={`space-y-2 p-4 border rounded-lg bg-gray-50 dark:bg-zinc-900/50 ${fe.coverImage ? "border-red-400" : ""}`}>
          <Label htmlFor="coverFile" className="font-semibold block mb-1">
            Image de couverture
          </Label>

          {product?.coverImage && !selectedCoverFile && (
            <div className="flex items-center gap-2 mb-3 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded w-fit">
              <span>✓ Image actuelle conservée</span>
            </div>
          )}

          <Input
            id="coverFile"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => setSelectedCoverFile(e.target.files?.[0] || null)}
            className="cursor-pointer bg-white"
          />
          {fe.coverImage
            ? <p className="text-xs text-red-500">{fe.coverImage}</p>
            : <p className="text-xs text-muted-foreground">JPG, PNG ou WebP. Max 5 MB.</p>
          }
        </div>

        {/* 2. Fichier Produit Principal */}
        <div className={`space-y-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 ${fe.productFile ? "border-red-400!" : ""}`}>
          <Label htmlFor="productFile" className="font-semibold block mb-1">
            Fichier à vendre (Produit)
          </Label>

          {product?.fileStorageKey && !selectedProductFile && (
            <div className="flex items-center gap-2 mb-3 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded w-fit">
              <span>✓ Fichier produit actuel conservé</span>
            </div>
          )}

          <Input
            id="productFile"
            type="file"
            accept=".pdf,.epub,.zip,.mp4,.mov"
            onChange={(e) => setSelectedProductFile(e.target.files?.[0] || null)}
            className="cursor-pointer bg-white"
          />
          {fe.productFile
            ? <p className="text-xs text-red-500">{fe.productFile}</p>
            : <p className="text-xs text-muted-foreground">PDF, EPUB, ZIP ou Vidéo. Max 1 GB. Stockage sécurisé et privé.</p>
          }
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* --- PUBLICATION --- */}
      <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
        <Switch
          id="isPublished"
          name="isPublished"
          defaultChecked={product?.isPublished}
        />
        <Label htmlFor="isPublished" className="cursor-pointer font-medium">
          Rendre ce produit public immédiatement
        </Label>
      </div>

      {/* --- BOUTON DE SOUMISSION --- */}
      <Button
        type="submit"
        disabled={loading || uploading}
        className="w-full h-11 text-base font-medium"
      >
        {uploading
          ? "Upload des fichiers vers le cloud..."
          : loading
            ? "Enregistrement..."
            : product ? "Mettre à jour le produit" : "Créer le produit"
        }
      </Button>
    </form>
  );
}