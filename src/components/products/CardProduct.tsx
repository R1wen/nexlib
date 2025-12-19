import Image from "next/image";
import { ProductTypeLabels } from "@/src/lib/schemas/product.schema";
import { Product } from "@/app/generated/prisma/client";
import { formatPrice } from "@/src/lib/format";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

interface CardProductProps {
  product: Product;
}

export function CardProduct({ product }: CardProductProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={product.coverImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={product.type}>
            {ProductTypeLabels[product.type]}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold">
            {formatPrice(product.price)}
          </span>
          <Link href={`/products/${product.slug}`}>
            <Button>Voir détails</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
