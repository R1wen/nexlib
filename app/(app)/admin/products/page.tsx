import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { adminTogglePublish, adminDeleteProduct } from "@/lib/actions/admin";

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { accessRights: true } },
        },
    });

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Gestion des produits</h1>
                <p className="text-muted-foreground">
                    {products.length} produit{products.length !== 1 ? "s" : ""} au total sur la plateforme.
                </p>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead>Vendeur</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Ventes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Aucun produit.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0">
                                                <img
                                                    src={product.coverImage}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="line-clamp-1 max-w-[180px]">{product.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                                        {product.sellerId}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {formatPrice(product.price)}
                                    </TableCell>
                                    <TableCell className="capitalize">{product.type}</TableCell>
                                    <TableCell>
                                        {product.isPublished ? (
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                                Publié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Brouillon
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{product._count.accessRights}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <form
                                                action={async () => {
                                                    "use server";
                                                    await adminTogglePublish(product.id, product.isPublished);
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-8 px-2 ${product.isPublished ? "text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50" : "text-green-700 hover:text-green-800 hover:bg-green-50"}`}
                                                >
                                                    {product.isPublished ? (
                                                        <><EyeOff className="h-4 w-4 mr-1" /> Dépublier</>
                                                    ) : (
                                                        <><Eye className="h-4 w-4 mr-1" /> Publier</>
                                                    )}
                                                </Button>
                                            </form>

                                            <form
                                                action={async () => {
                                                    "use server";
                                                    await adminDeleteProduct(product.id);
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Supprimer
                                                </Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
