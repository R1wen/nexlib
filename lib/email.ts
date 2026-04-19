import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

function formatXOF(amountCents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  }).format(amountCents / 100);
}

export async function sendPurchaseConfirmation({
  to,
  productName,
  amountPaid,
}: {
  to: string;
  productName: string;
  amountPaid: number;
}) {
  await resend.emails.send({
    from: "NexLib <noreply@nexlib.com>",
    to,
    subject: `Confirmation d'achat — ${productName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111827; font-size: 24px; font-weight: 700;">Merci pour votre achat !</h1>
        <p style="color: #4b5563; font-size: 16px;">
          Votre achat de <strong>${productName}</strong> a bien été confirmé.
        </p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #111827; font-size: 16px;">
            <strong>Produit :</strong> ${productName}<br/>
            <strong>Montant payé :</strong> ${formatXOF(amountPaid)}
          </p>
        </div>
        <p style="color: #4b5563; font-size: 14px;">
          Vous pouvez accéder à votre produit à tout moment depuis votre
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #6366f1;">tableau de bord</a>.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          NexLib — Votre marketplace de produits numériques
        </p>
      </div>
    `,
  });
}

export async function sendContactMessage({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await resend.emails.send({
    from: "NexLib Contact <noreply@nexlib.com>",
    to: process.env.ADMIN_EMAIL!,
    replyTo: email,
    subject: `[Contact NexLib] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111827;">Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <div style="background: #f9fafb; border-left: 4px solid #6366f1; padding: 16px; margin-top: 16px;">
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  });
}
