import { z } from "zod";

export const AccessRightSchema = z.object({
    id: z.string().uuid(),
    clerkUserId: z.string().min(1, "L'ID utilisateur est requis"),
    productId: z.string().uuid(),
    stripeCheckoutSessionId: z.string().min(1),
    amountPaid: z.number().int().nonnegative(),
    currency: z.literal("XOF"),
    status: z.enum(["ACTIVE", "REVOKED"]).default("ACTIVE"),
    purchaseDate: z.date(),
    expiresAt: z.date().nullable(),
    lastDownloadedAt: z.date().nullable().optional(),
    downloadCount: z.number().int().default(0),
});

export type AccessRight = z.infer<typeof AccessRightSchema>;
