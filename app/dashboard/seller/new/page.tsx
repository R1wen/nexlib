import { ProductForm } from "../_components/ProductForm";

export default function NewProductPage() {
    return (
        <div className="container mx-auto px-4 py-10 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Nouveau Produit</h1>
                <p className="text-muted-foreground">
                    Ajoutez un ebook ou une formation à votre catalogue.
                </p>
            </div>

            <ProductForm />
        </div>
    );
}
