import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NexLib - Ebooks et Formations de Qualité",
  description: "Accédez à une bibliothèque d'ebooks et de formations de qualité pour développer vos compétences. Téléchargements sécurisés et accès instantané.",
};


export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="relative bg-linear-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Développez vos compétences avec nos{" "}
              <span className="text-primary">ressources numériques</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Accédez à une bibliothèque d&apos;ebooks et de formations de qualité pour booster votre carrière
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/products">Explorer les produits</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">En savoir plus</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Pourquoi choisir NexLib ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une plateforme sécurisée pour accéder à vos contenus numériques
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3 p-6 rounded-lg border bg-card">
            <div className="text-4xl">🔒</div>
            <h3 className="text-xl font-semibold">Sécurisé</h3>
            <p className="text-sm text-muted-foreground">
              Téléchargements protégés avec liens signés et temporaires
            </p>
          </div>
          <div className="text-center space-y-3 p-6 rounded-lg border bg-card">
            <div className="text-4xl">⚡</div>
            <h3 className="text-xl font-semibold">Accès instantané</h3>
            <p className="text-sm text-muted-foreground">
              Accédez à vos contenus immédiatement après paiement
            </p>
          </div>
          <div className="text-center space-y-3 p-6 rounded-lg border bg-card">
            <div className="text-4xl">📚</div>
            <h3 className="text-xl font-semibold">Contenu de qualité</h3>
            <p className="text-sm text-muted-foreground">
              Ebooks et formations créés par des experts
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
