import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Produits", href: "/products" },
  { name: "A propos", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors ml-10"
        >
          NexLib
        </Link>

        <nav className="flex items-center space-x-4">
          {navigation.map((link) => {
            return (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium hover:text-blue-600 hidden sm:inline-block"
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex gap-3">
          <SignedOut>
            <SignInButton>
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="secondary" size="sm">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
