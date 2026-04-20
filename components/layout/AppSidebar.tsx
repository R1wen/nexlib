import { currentUser } from "@clerk/nextjs/server"
import { UserButton } from "@clerk/nextjs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { NavItems } from "@/components/layout/NavItems"

const placeholderSections = ["People", "Business", "Settings"]

export async function AppSidebar() {
  const user = await currentUser()

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="px-6 py-5 border-b border-gray-200">
        <span className="text-xl font-bold tracking-tight text-gray-900">
          NexLib
        </span>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {placeholderSections.map((section) => (
          <SidebarGroup key={section} className="mt-4">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
              {section}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <p className="px-3 text-xs text-gray-300 italic">
                Bientot disponible
              </p>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <UserButton />
          {user && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
