"use server";

import { z } from "zod";
import { sendContactMessage } from "@/lib/email";

const ContactSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(3, "Sujet requis"),
  message: z.string().min(10, "Message trop court"),
});

export async function submitContactForm(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const result = ContactSchema.safeParse(raw);
  if (!result.success) {
    const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError ?? "Données invalides." };
  }

  try {
    await sendContactMessage(result.data);
    return { success: true };
  } catch (err) {
    console.error("Erreur envoi contact:", err);
    return { error: "Impossible d'envoyer le message. Réessayez plus tard." };
  }
}
