"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { createProduct, updateProduct } from "@/src/lib/actions/products";
import { Product } from "@prisma/client";

interface ProductFormProps {
    product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const data = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            price: Number(formData.get("price")),
            type: formData.get("type") as "ebook" | "formation",
            coverImage: formData.get("coverImage") as string,
            fileStorageKey: formData.get("fileStorageKey") as string, // Temporaire: URL direct
            isPublished: formData.get("isPublished") === "on",
        };

        // Ajout des champs requis par le schema Zod mais non présents dans ce formulaire simplifié
        const payload = {
            ...data,
            currency: "XOF",
        };


        try {
            if (product) {
                await updateProduct(product.id, payload);
            } else {
                await createProduct(payload as any);
            }
            // router.refresh(); // géré par server action
        } catch (e) {
            setError("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 max-w-2xl">
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={product?.name}
                    required
                    placeholder="Ex: Maîtriser Next.js 15"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={product?.description}
                    required
                    placeholder="Une description détaillée de votre produit..."
                    rows={5}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Prix (XOF)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        defaultValue={product?.price}
                        required
                        min={100}
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

            <div className="space-y-2">
                <Label htmlFor="coverImage">Image de couverture (URL)</Label>
                <Input
                    id="coverImage"
                    name="coverImage"
                    type="url"
                    defaultValue={product?.coverImage}
                    required
                    placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                    Entrez une URL d'image valide (stockage temporaire avant upload réel).
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="fileStorageKey">Lien du fichier (URL)</Label>
                <Input
                    id="fileStorageKey"
                    name="fileStorageKey"
                    type="text"
                    defaultValue={product?.fileStorageKey}
                    required
                    placeholder="Lien vers le fichier à télécharger"
                />
                <p className="text-xs text-muted-foreground">
                    URL privée ou clé. Sera remplacé par l'upload de fichier plus tard.
                </p>
            </div>

            <div className="flex items-center space-x-2">
                <Switch id="isPublished" name="isPublished" defaultChecked={product?.isPublished} />
                <Label htmlFor="isPublished">Publier ce produit immédiatement</Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Enregistrement..." : (product ? "Mettre à jour" : "Créer le produit")}
            </Button>
        </form>
    );
}
