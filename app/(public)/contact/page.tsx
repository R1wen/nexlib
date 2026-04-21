import type { Metadata } from "next";
import { ContactForm } from "@/app/contact/_components/ContactForm";

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
            Une question ? N&apos;hésitez pas à nous écrire
          </p>
        </div>

        <div className="bg-card border rounded-lg p-8">
          <ContactForm />
          <p className="text-sm text-muted-foreground text-center mt-6">
            Nous vous répondrons dans les plus brefs délais
          </p>
        </div>
      </div>
    </div>
  );
}
