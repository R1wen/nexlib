import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À Propos - NexLib",
  description: "Découvrez NexLib, votre plateforme de vente de produits numériques",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">À Propos de NexLib</h1>
          <p className="text-xl text-muted-foreground">
            Votre partenaire pour l'apprentissage numérique
          </p>
        </div>

        <section className="prose prose-lg dark:prose-invert max-w-none">
          <h2>Notre Mission</h2>
          <p>
            NexLib est une plateforme moderne dédiée à la distribution sécurisée de contenus
            numériques éducatifs. Nous croyons que l'accès à la connaissance doit être simple,
            sécurisé et accessible à tous.
          </p>

          <h2>Sécurité et Confiance</h2>
          <p>
            La sécurité de vos achats est notre priorité. Nous utilisons des technologies
            de pointe pour protéger vos téléchargements :
          </p>
          <ul>
            <li>Liens de téléchargement signés et temporaires</li>
            <li>Accès contrôlé uniquement après paiement validé</li>
            <li>Protection des données personnelles</li>
            <li>Paiements sécurisés</li>
          </ul>

          <h2>Notre Catalogue</h2>
          <p>
            Nous proposons une sélection soigneusement choisie d'ebooks et de formations
            dans divers domaines : développement web, design, marketing digital, et bien plus encore.
          </p>
        </section>

        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Une question ?</h3>
          <p className="text-muted-foreground mb-6">
            Notre équipe est là pour vous aider
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}
