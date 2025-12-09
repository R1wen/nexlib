export function formatPrice(priceInCents: number): string {
    const fcfa = priceInCents / 100;
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
    }).format(fcfa);
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}
