"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Info, Phone, ShoppingBag, Store, ChevronRight, ShieldCheck } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

const dashboardSubItems = [
  { title: "Mes achats", href: "/dashboard", icon: ShoppingBag, exact: true },
  { title: "Mes produits", href: "/dashboard/seller", icon: Store },
]

const mainItems = [
  { title: "Produits", href: "/products", icon: Package, exact: true },
  { title: "A propos", href: "/about", icon: Info, exact: true },
  { title: "Contact", href: "/contact", icon: Phone, exact: true },
]

export function NavItems({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const isDashboardActive =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  const [dashboardOpen, setDashboardOpen] = useState(isDashboardActive)

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          isActive={isDashboardActive}
          onClick={() => setDashboardOpen((prev) => !prev)}
          className={cn(
            "flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors w-full cursor-pointer",
            isDashboardActive && "text-gray-900 font-medium"
          )}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          <span className="flex-1">Dashboard</span>
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-gray-400 transition-transform duration-200",
              dashboardOpen && "rotate-90"
            )}
          />
        </SidebarMenuButton>

        {dashboardOpen && (
          <SidebarMenuSub>
            {dashboardSubItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton asChild isActive={isActive}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors",
                        isActive && "text-gray-900 font-medium"
                      )}
                    >
                      <item.icon className="size-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>

      {mainItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/")

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} size="lg">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors",
                  isActive && "text-gray-900 border-r-2 border-orange-500 font-medium"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}

      {isAdmin && (() => {
        const isAdminActive = pathname === "/admin" || pathname.startsWith("/admin/")
        return (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isAdminActive} size="lg">
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors",
                  isAdminActive && "text-gray-900 border-r-2 border-orange-500 font-medium"
                )}
              >
                <ShieldCheck className="size-4 shrink-0" />
                <span>Administration</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })()}
    </>
  )
}
