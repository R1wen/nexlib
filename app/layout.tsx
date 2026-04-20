import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NexLib - Plateforme de Produits Numériques",
    template: "%s | NexLib",
  },
  description:
    "Plateforme sécurisée de vente d'ebooks et de formations. Accès instantané après paiement avec téléchargements protégés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col flex-1 min-h-screen">
              <div className="flex items-center h-12 px-4 border-b border-slate-800 md:hidden">
                <SidebarTrigger />
              </div>
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </SidebarProvider>
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
