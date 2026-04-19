import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-gray-50 py-8">
      <div className="container flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
        <p className="text-sm text-gray-500">
          &copy; {currentYear} NexLib (Projet Atelier IT). Tous droits réservés.
        </p>

        <div className="flex space-x-6">
          <Link
            href="#"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Mentions Légales
          </Link>
          <Link
            href="#"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            CGV (Conditions Générales de Vente)
          </Link>
        </div>
      </div>
    </footer>
  );
}
