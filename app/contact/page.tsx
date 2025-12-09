import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - NexLib",
  description: "Contactez l'équipe NexLib pour toute question",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Contactez-nous</h1>
          <p className="text-lg text-muted-foreground">
            Une question ? N'hésitez pas à nous écrire
          </p>
        </div>

        <div className="bg-card border rounded-lg p-8">
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="jean.dupont@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Sujet
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Question sur un produit"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Votre message..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Envoyer le message
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Nous vous répondrons dans les plus brefs délais
          </p>
        </div>
      </div>
    </div>
  );
}
