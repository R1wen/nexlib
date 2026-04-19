"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { submitContactForm } from "@/lib/actions/contact";

const initialState = { error: undefined, success: undefined } as {
  error?: string;
  success?: boolean;
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Message envoyé ! Nous vous répondrons bientôt.");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
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
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
