import Link from "next/link"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          NexLib
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/products" className="hover:text-gray-900 transition-colors">Produits</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">À propos</Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="redirect">
              <Button variant="ghost" size="sm">Connexion</Button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <Button size="sm">S&apos;inscrire</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/seller">Mon espace</Link>
            </Button>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
