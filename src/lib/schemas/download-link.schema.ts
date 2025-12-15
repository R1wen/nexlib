import { z } from "zod";

export const DownloadLinkSchema = z.object({
    id: z.string().uuid(),
    clerkUserId: z.string().min(1),
    productId: z.string().uuid(),

    // Le token sécurisé qui sera dans l'URL (ex: ?token=xyz...)
    token: z.string().min(10),

    expiresAt: z.date(),
    createdAt: z.date(),
    usedAt: z.date().nullable().optional(), // Pour savoir si/quand il a été utilisé

    // Métadonnées utiles pour les logs
    ipAddress: z.string().ipv4().optional(),
    userAgent: z.string().optional(),
});

export type DownloadLink = z.infer<typeof DownloadLinkSchema>;
