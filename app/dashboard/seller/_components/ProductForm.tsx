"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/app/generated/prisma/client"; // Ton type Prisma généré
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

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  
  // États du formulaire
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // États des fichiers locaux (nouveaux fichiers sélectionnés)
  const [selectedProductFile, setSelectedProductFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

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
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    
    // Initialisation avec les valeurs existantes (cas édition)
    let finalFileKey = product?.fileStorageKey || "";
    let finalCoverKey = product?.coverImage || "";

    try {
      // ÉTAPE 1 : GESTION DES FICHIERS (Uploads R2)
      if (selectedProductFile || selectedCoverFile) {
        setUploading(true);
        const uploadPromises: Promise<void>[] = [];

        // Si un nouveau fichier produit est sélectionné
        if (selectedProductFile) {
          uploadPromises.push(
            uploadToR2(selectedProductFile, "products").then((key) => {
              finalFileKey = key;
            })
          );
        }

        // Si une nouvelle image de couverture est sélectionnée
        if (selectedCoverFile) {
          uploadPromises.push(
            uploadToR2(selectedCoverFile, "covers").then((key) => {
              finalCoverKey = key;
            })
          );
        }

        // On attend que tous les uploads soient finis
        await Promise.all(uploadPromises);
        setUploading(false);
      }

      // Validation finale des fichiers requis
      if (!finalFileKey) throw new Error("Le fichier numérique du produit est requis.");
      if (!finalCoverKey) throw new Error("L'image de couverture est requise.");

      // ÉTAPE 2 : PRÉPARATION DU PAYLOAD
      const payload = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: Number(formData.get("price")),
        type: formData.get("type") as "ebook" | "formation",
        isPublished: formData.get("isPublished") === "on",
        
        // Champs techniques
        coverImage: finalCoverKey,
        fileStorageKey: finalFileKey,
        fileSize: selectedProductFile?.size, // Mettre à jour la taille si nouveau fichier
        fileMimeType: selectedProductFile?.type,
      };

      // ÉTAPE 3 : SAUVEGARDE DB (Server Actions)
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload as any); // "as any" car le schema Create attend des champs stricts
      }

      // Le redirect est géré dans la Server Action, mais au cas où :
      // router.push("/dashboard/seller"); 

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-2xl mx-auto py-6">
      
      {/* --- BLOC ERREUR --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-sm">
          🚨 {error}
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
            required
            placeholder="Ex: Guide complet Next.js 15"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            required
            placeholder="Décrivez ce que contient votre produit..."
            rows={5}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (XOF)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              defaultValue={product?.price}
              required
              min={100}
              placeholder="5000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de produit</Label>
            <Select name="type" defaultValue={product?.type || "ebook"}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ebook">Ebook (PDF, EPUB)</SelectItem>
                <SelectItem value="formation">Formation Vidéo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* --- SECTION FICHIERS (Cloudflare R2) --- */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Fichiers numériques</h3>

        {/* 1. Image de Couverture */}
        <div className="space-y-2 p-4 border rounded-lg bg-gray-50 dark:bg-zinc-900/50">
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
            required={!product?.coverImage} // Requis seulement si pas d'image existante
          />
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG ou WebP. Max 5 MB.
          </p>
        </div>

        {/* 2. Fichier Produit Principal */}
        <div className="space-y-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
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
            required={!product?.fileStorageKey}
          />
          <p className="text-xs text-muted-foreground mt-1">
            PDF, EPUB, ZIP ou Vidéo. Max 1 GB. Stockage sécurisé et privé.
          </p>
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
            ? "☁️ Upload des fichiers vers le cloud..." 
            : (loading 
                ? "💾 Enregistrement..." 
                : (product ? "Mettre à jour le produit" : "Créer le produit")
              )
        }
      </Button>
    </form>
  );
}