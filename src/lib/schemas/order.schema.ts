import { z } from "zod";

// Statut de la commande
export const OrderStatusSchema = z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]);

// Une ligne de commande (snapshot du produit au moment de l'achat)
export const OrderItemSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    productId: z.string().uuid(),
    productName: z.string(),
    pricePaid: z.number().int().nonnegative(),
    currency: z.literal("XOF"),
});

// La commande globale (L'historique)
export const OrderHistorySchema = z.object({
    id: z.string().uuid(),
    clerkUserId: z.string().min(1, "L'ID utilisateur est requis"),
    stripeCheckoutSessionId: z.string().min(1),
    stripePaymentIntentId: z.string().optional(),
    totalAmount: z.number().int().nonnegative(),
    currency: z.literal("XOF"),

    status: OrderStatusSchema,

    // Relations
    items: z.array(OrderItemSchema),

    createdAt: z.date(),
    updatedAt: z.date(),
});

export type OrderHistory = z.infer<typeof OrderHistorySchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderStatusLabels: Record<OrderStatus, string> = {
    PENDING: "En attente",
    COMPLETED: "Payé",
    FAILED: "Échoué",
    REFUNDED: "Remboursé",
};
