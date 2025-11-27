"use client";
import { Calendar, Home, Inbox, Search, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";

const items = [
  {
    title: "Products",
    url: "/admin/products",
    icon: Home,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: Inbox,
  }
];

export function AppSidebar() {
  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/sign-in" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-white border-r border-gray-200 shadow-lg flex flex-col h-full">
        {/* Main Navigation Items */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-2xl font-extrabold text-gray-900 px-6 py-5 select-none tracking-tight">
            Frame-Kart
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col space-y-1 px-2 py-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <a
                    href={item.url}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-neutral-900 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 group"
                  >
                    <item.icon 
                      className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    <span className="text-base font-medium">{item.title}</span>
                  </a>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Section - Fixed at bottom */}
        <SidebarGroup className="mt-auto border-t border-gray-200">
          <SidebarGroupContent>
            <SidebarMenu className="px-2 py-3">
              <SidebarMenuItem>
                <button
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-600 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 group w-full text-left"
                >
                  <LogOut 
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <span className="text-base font-medium">Logout</span>
                </button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}