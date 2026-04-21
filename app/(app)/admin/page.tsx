import prisma from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ShoppingCart, Package, Users, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
        totalRevenueData,
        monthRevenueData,
        publishedCount,
        sellerCount,
        recentOrders,
        pendingOrdersCount,
    ] = await Promise.all([
        prisma.accessRight.aggregate({
            where: { status: "ACTIVE" },
            _sum: { amountPaid: true },
        }),
        prisma.accessRight.aggregate({
            where: { status: "ACTIVE", purchaseDate: { gte: startOfMonth } },
            _sum: { amountPaid: true },
        }),
        prisma.product.count({ where: { isPublished: true } }),
        prisma.product.groupBy({ by: ["sellerId"] }).then((r) => r.length),
        prisma.orderHistory.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { items: true },
        }),
        prisma.orderHistory.count({ where: { status: "PENDING" } }),
    ]);

    const totalRevenue = totalRevenueData._sum.amountPaid ?? 0;
    const monthRevenue = monthRevenueData._sum.amountPaid ?? 0;

    const kpis = [
        {
            label: "Revenus totaux",
            value: formatPrice(totalRevenue),
            icon: TrendingUp,
            sub: "toutes ventes confondues",
        },
        {
            label: "Revenus ce mois",
            value: formatPrice(monthRevenue),
            icon: TrendingUp,
            sub: "depuis le 1er du mois",
        },
        {
            label: "Produits publiés",
            value: publishedCount.toString(),
            icon: Package,
            sub: "actuellement en ligne",
        },
        {
            label: "Vendeurs actifs",
            value: sellerCount.toString(),
            icon: Users,
            sub: "ayant au moins 1 produit",
        },
    ];

    const statusLabel: Record<string, string> = {
        PENDING: "En attente",
        COMPLETED: "Complété",
        FAILED: "Échoué",
        REFUNDED: "Remboursé",
    };

    const statusClass: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        COMPLETED: "bg-green-100 text-green-800",
        FAILED: "bg-red-100 text-red-800",
        REFUNDED: "bg-gray-100 text-gray-800",
    };

    return (
        <div className="container mx-auto px-4 py-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
                <p className="text-muted-foreground">Vue d&apos;ensemble de la plateforme NexLib.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border bg-card p-5 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-sm font-medium">{kpi.label}</span>
                            <kpi.icon className="h-4 w-4" />
                        </div>
                        <p className="text-2xl font-bold">{kpi.value}</p>
                        <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {pendingOrdersCount > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 shrink-0" />
                    <span>
                        <strong>{pendingOrdersCount}</strong> commande{pendingOrdersCount > 1 ? "s" : ""} en statut PENDING.
                    </span>
                </div>
            )}

            <div>
                <h2 className="text-xl font-semibold mb-4">Dernières commandes</h2>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Session Stripe</TableHead>
                                <TableHead>Produits</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Aucune commande.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs truncate max-w-[160px]">
                                            {order.stripeCheckoutSessionId}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {order.items.map((i) => i.productName).join(", ")}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatPrice(order.totalAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass[order.status] ?? "bg-gray-100 text-gray-800"}`}>
                                                {statusLabel[order.status] ?? order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {formatDate(order.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
